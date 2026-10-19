import { supabase } from '../config/supabase.js';

export const trackEvent = async (req, res) => {
    const { wallpaperId, event_type } = req.body; // event_type: view, share
    try {
        const { error } = await supabase.from('analytics').insert({
            wallpaper_id: wallpaperId,
            event_type
        });
        if (error) throw error;
        res.status(200).json({ message: `${event_type} tracked` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPopular = async (req, res) => {
    try {
        // Since we don't have a views column, we count from analytics table
        const { data, error } = await supabase
            .from('analytics')
            .select('wallpaper_id, wallpapers(name, slug)')
            .eq('event_type', 'view');

        if (error) throw error;

        // Group and count in memory for simplicity or use a more complex query if needed
        // For now, let's keep it robust
        const counts = data.reduce((acc, curr) => {
            const id = curr.wallpaper_id;
            if (!acc[id]) acc[id] = { ...curr.wallpapers, id, views: 0 };
            acc[id].views++;
            return acc;
        }, {});

        const sorted = Object.values(counts).sort((a, b) => b.views - a.views).slice(0, 5);
        res.status(200).json(sorted);
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

        const { data: topWallpaper } = await supabase.from('wallpapers')
            .select('name')
            .order('views', { ascending: false })
            .limit(1)
            .maybeSingle();

        res.status(200).json({
            wallpapers: wallpapers || 0,
            categories: categories || 0,
            leads: leads || 0,
            dealers: dealers || 0,
            books: books || 0,
            topWallpaper: topWallpaper?.name || 'None'
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};
