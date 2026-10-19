import { supabase } from '../config/supabase.js';

export const trackEvent = async (req, res) => {
    const { wallpaperId, slug, event_type = 'view' } = req.body;
    try {
        let wpId = wallpaperId;
        
        // If slug is provided instead of ID, resolve it
        if (!wpId && slug) {
            const { data: wp } = await supabase.from('wallpapers').select('id, views').eq('slug', slug).maybeSingle();
            if (wp) {
                wpId = wp.id;
            }
        }

        if (wpId) {
            // 1. Insert event into analytics table
            const { error: insertErr } = await supabase.from('analytics').insert({
                wallpaper_id: wpId,
                event_type
            });
            if (insertErr) console.error('Analytics insert error:', insertErr.message);

            // 2. Increment views on wallpapers table when event_type is view
            if (event_type === 'view') {
                const { data: wp } = await supabase.from('wallpapers').select('views').eq('id', wpId).maybeSingle();
                if (wp) {
                    await supabase.from('wallpapers').update({
                        views: (wp.views || 0) + 1
                    }).eq('id', wpId);
                }
            }
        }

        res.status(200).json({ success: true, message: `${event_type} tracked` });
    } catch (error) {
        console.error('Track event error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPopular = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('wallpapers')
            .select(`
                id,
                name,
                slug,
                design_code,
                views,
                price,
                images:wallpaper_images(image_url, position)
            `)
            .order('views', { ascending: false })
            .limit(10);

        if (error) throw error;

        const formatted = (data || []).map(w => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            design_code: w.design_code,
            views: w.views || 0,
            price: w.price,
            thumbnail: w.images?.sort((a, b) => a.position - b.position)?.[0]?.image_url || null
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        let { startDate, endDate, datePreset } = req.query;
        if (datePreset && datePreset !== 'ALL' && (!startDate || !endDate)) {
            const now = new Date();
            const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (datePreset === 'TODAY') {
                startDate = formatYMD(now);
                endDate = formatYMD(now);
            } else if (datePreset === '7DAYS') {
                const past = new Date(now);
                past.setDate(past.getDate() - 7);
                startDate = formatYMD(past);
                endDate = formatYMD(now);
            } else if (datePreset === '30DAYS') {
                const past = new Date(now);
                past.setDate(past.getDate() - 30);
                startDate = formatYMD(past);
                endDate = formatYMD(now);
            } else if (datePreset === 'THIS_MONTH') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = formatYMD(firstDay);
                endDate = formatYMD(now);
            }
        }

        let leadsQuery = supabase.from('leads').select('*', { count: 'exact', head: true });
        if (startDate) {
            const sIso = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
            leadsQuery = leadsQuery.gte('created_at', sIso);
        }
        if (endDate) {
            const eIso = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;
            leadsQuery = leadsQuery.lte('created_at', eIso);
        }

        const [{ count: wallpapers }, { count: categories }, { count: leads }, { count: dealers }, { count: books }] = await Promise.all([
            supabase.from('wallpapers').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            leadsQuery,
            supabase.from('dealers').select('*', { count: 'exact', head: true }),
            supabase.from('books').select('*', { count: 'exact', head: true })
        ]);

        // Get Top 5 viewed wallpapers with image thumbnails
        const { data: topWallpapers } = await supabase
            .from('wallpapers')
            .select(`
                id,
                name,
                slug,
                design_code,
                views,
                images:wallpaper_images(image_url, position)
            `)
            .order('views', { ascending: false })
            .limit(5);

        // Calculate total views across all wallpapers
        const { data: allViewsData } = await supabase.from('wallpapers').select('views');
        const totalViews = (allViewsData || []).reduce((acc, curr) => acc + (curr.views || 0), 0);

        res.status(200).json({
            wallpapers: wallpapers || 0,
            categories: categories || 0,
            leads: leads || 0,
            dealers: dealers || 0,
            books: books || 0,
            totalViews: totalViews || 0,
            topWallpaper: topWallpapers?.[0]?.name || 'None',
            topWallpaperViews: topWallpapers?.[0]?.views || 0,
            topWallpapers: (topWallpapers || []).map(w => ({
                id: w.id,
                name: w.name,
                slug: w.slug,
                design_code: w.design_code,
                views: w.views || 0,
                thumbnail: w.images?.sort((a, b) => a.position - b.position)?.[0]?.image_url || null
            }))
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};
