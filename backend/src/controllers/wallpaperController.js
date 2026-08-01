import { supabase } from '../config/supabase.js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { scoreWallpaper } from '../utils/scoreWallpaper.js';
import fs from 'fs';
import path from 'path';
import { deleteAssetFromDisk } from './uploadController.js';

export const getAllWallpapers = async (req, res) => {
    try {
        const queryParams = { ...req.query, ...req.body };
        const { group_id, category_id, book_id, search, activeOnly, tag } = queryParams;

        // Helper to fetch in chunks to avoid PostgREST 50KB URI limits
        const fetchInChunks = async (table, selectStr, column, ids) => {
            if (!ids || ids.length === 0) return [];
            let allData = [];
            for (let i = 0; i < ids.length; i += 50) {
                const chunk = ids.slice(i, i + 50);
                const { data, error } = await supabase.from(table).select(selectStr).in(column, chunk);
                if (error) throw error;
                if (data) allData = allData.concat(data);
            }
            return allData;
        };

        let filterIds = null;

        if (search || category_id || group_id || book_id) {
            let allMatchIds = [];
            let isFirstFilter = true;

            const intersectIds = (newIds) => {
                if (isFirstFilter) {
                    allMatchIds = newIds;
                    isFirstFilter = false;
                } else {
                    allMatchIds = allMatchIds.filter(id => newIds.includes(id));
                }
            };

            // 1. Search filter
            if (search) {
                const { data: matchedBooks } = await supabase.from('books').select('id').or(`code.ilike.%${search}%,name.ilike.%${search}%`);
                const matchedBookIds = matchedBooks?.map(b => b.id) || [];

                let relatedWallpaperIds = [];
                if (matchedBookIds.length > 0) {
                    const matchedRels = await fetchInChunks('book_wallpapers', 'wallpaper_id', 'book_id', matchedBookIds);
                    relatedWallpaperIds = matchedRels.map(r => r.wallpaper_id);
                }

                const { data: matchedDirect } = await supabase.from('wallpapers').select('id').or(`name.ilike.%${search}%,slug.ilike.%${search}%,design_code.ilike.%${search}%`);
                const directIds = matchedDirect?.map(w => w.id) || [];

                intersectIds([...new Set([...relatedWallpaperIds, ...directIds])]);
            }

            // 2. Category filter
            if (category_id) {
                const catRels = await fetchInChunks('wallpaper_categories', 'wallpaper_id', 'category_id', category_id.split(','));
                intersectIds(catRels.map(r => r.wallpaper_id));
            }

            // 3. Group filter
            if (group_id) {
                const groupIdsArr = group_id.split(',');
                const groupRels = await fetchInChunks('wallpaper_groups', 'wallpaper_id', 'group_id', groupIdsArr);
                
                // Fallback: Find wallpapers linked to categories that belong to this group
                const catsInGroup = await fetchInChunks('categories', 'id', 'group_id', groupIdsArr);
                let catFallbackIds = [];
                if (catsInGroup && catsInGroup.length > 0) {
                     const catFallbackRels = await fetchInChunks('wallpaper_categories', 'wallpaper_id', 'category_id', catsInGroup.map(c => c.id));
                     catFallbackIds = catFallbackRels.map(r => r.wallpaper_id);
                }
                
                intersectIds([...new Set([...groupRels.map(r => r.wallpaper_id), ...catFallbackIds])]);
            }

            // 4. Book filter
            if (book_id) {
                const bookRels = await fetchInChunks('book_wallpapers', 'wallpaper_id', 'book_id', book_id.split(','));
                intersectIds(bookRels.map(r => r.wallpaper_id));
            }

            filterIds = allMatchIds;
        }

        // Apply intersected IDs to main query
        let data = [];
        if (filterIds !== null) {
            if (filterIds.length === 0) {
                return res.status(200).json([]); // No matches
            }
            
            // Chunk the final query as well
            for (let i = 0; i < filterIds.length; i += 40) {
                const chunk = filterIds.slice(i, i + 40);
                let query = supabase.from('wallpapers').select(`
                    *,
                    images:wallpaper_images(*),
                    videos:wallpaper_videos(*),
                    categories:wallpaper_categories(category:categories(*)),
                    groups:wallpaper_groups(group:category_groups(*)),
                    books:book_wallpapers(book:books(*))
                `);
                
                if (activeOnly === 'true') {
                    query = query.eq('is_active', true);
                }
                
                query = query.in('id', chunk);
                
                const { data: chunkData, error } = await query;
                if (error) throw error;
                if (chunkData) data = data.concat(chunkData);
            }
        } else {
            // No filters applied, just run the base query once
            let query = supabase.from('wallpapers').select(`
                *,
                images:wallpaper_images(*),
                videos:wallpaper_videos(*),
                categories:wallpaper_categories(category:categories(*)),
                groups:wallpaper_groups(group:category_groups(*)),
                books:book_wallpapers(book:books(*))
            `);
            
            if (activeOnly === 'true') {
                query = query.eq('is_active', true);
            }
            
            const { data: baseData, error } = await query;
            if (error) throw error;
            if (baseData) data = baseData;
        }

        // Flatten nested relations for the response
        let formattedData = data.map(w => ({
            ...w,
            categories: (w.categories || []).map(c => c.category),
            groups: (w.groups || []).map(g => g.group),
            books: (w.books || []).map(b => b.book),
            images: (w.images || []).sort((a, b) => a.position - b.position),
            videos: (w.videos || []).sort((a, b) => a.position - b.position)
        }));

        // Handle tags (trending/new)
        if (tag === 'trending') {
            formattedData = formattedData.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
        } else if (tag === 'new_arrival') {
            formattedData = formattedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
        } else if (tag === 'limited_stock') {
            formattedData = formattedData
                .filter(w => (w.quantity || 0) > 0 && (w.quantity || 0) <= 20)
                .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
                .slice(0, 50);
        }

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWallpaperBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const { data, error } = await supabase.from('wallpapers').select(`
            *,
            images:wallpaper_images(*),
            videos:wallpaper_videos(*),
            categories:wallpaper_categories(category:categories(*)),
            groups:wallpaper_groups(group:category_groups(*)),
            books:book_wallpapers(book:books(*))
        `).eq('slug', slug).single();

        if (error) throw error;

        const formatted = {
            ...data,
            categories: data.categories.map(c => c.category),
            groups: data.groups.map(g => g.group),
            books: data.books.map(b => b.book),
            images: data.images.sort((a, b) => a.position - b.position),
            videos: data.videos.sort((a, b) => a.position - b.position)
        };

        res.status(200).json(formatted);
    } catch (error) {
        res.status(404).json({ message: 'Wallpaper not found' });
    }
};

export const createWallpaper = async (req, res) => {
    const {
        images, videos, category_ids, group_ids, book_ids,
        categories, groups, books,
        ...wallpaperData
    } = req.body;
    try {
        // 1. Create wallpaper entry
        const { data: wallpaper, error: wError } = await supabase
            .from('wallpapers')
            .insert(wallpaperData)
            .select()
            .single();

        if (wError) throw wError;

        // 2. Handle Images
        if (images && images.length > 0) {
            const imageInserts = images.map((url, index) => ({
                wallpaper_id: wallpaper.id,
                image_url: url,
                position: index + 1
            }));
            const { error: imgError } = await supabase.from('wallpaper_images').insert(imageInserts);
            if (imgError) throw imgError;
        }

        // 3. Handle Videos
        if (videos && videos.length > 0) {
            const videoInserts = videos.map((url, index) => ({
                wallpaper_id: wallpaper.id,
                video_url: url,
                position: index + 1
            }));
            const { error: vidError } = await supabase.from('wallpaper_videos').insert(videoInserts);
            if (vidError) throw vidError;
        }

        // 3. Handle Categories
        if (category_ids && category_ids.length > 0) {
            const catInserts = category_ids.map(id => ({
                wallpaper_id: wallpaper.id,
                category_id: id
            }));
            const { error: catError } = await supabase.from('wallpaper_categories').insert(catInserts);
            if (catError) throw catError;
        }

        // 4. Handle Groups
        if (group_ids && group_ids.length > 0) {
            const groupInserts = group_ids.map(id => ({
                wallpaper_id: wallpaper.id,
                group_id: id
            }));
            const { error: groupError } = await supabase.from('wallpaper_groups').insert(groupInserts);
            if (groupError) throw groupError;
        }

        // 5. Handle Books
        if (book_ids && book_ids.length > 0) {
            const bookInserts = book_ids.map(id => ({
                wallpaper_id: wallpaper.id,
                book_id: id
            }));
            const { error: bookError } = await supabase.from('book_wallpapers').insert(bookInserts);
            if (bookError) throw bookError;
        }

        res.status(201).json({ message: 'Wallpaper created successfully', id: wallpaper.id });
    } catch (error) {
        console.error('Create Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateWallpaper = async (req, res) => {
    const { id } = req.params;
    const {
        images, videos, category_ids, group_ids, book_ids,
        categories, groups, books,
        ...wallpaperData
    } = req.body;

    try {
        // 0. Fetch existing state for cleanup
        const { data: oldWallpaper } = await supabase
            .from('wallpapers')
            .select('swatch, images:wallpaper_images(image_url), videos:wallpaper_videos(video_url)')
            .eq('id', id)
            .single();

        // 1. Update basic info
        const { error: wError } = await supabase.from('wallpapers').update(wallpaperData).eq('id', id);
        if (wError) throw wError;

        // 2. Sync Images & Cleanup Orphans
        if (images) {
            const oldImageUrls = oldWallpaper?.images?.map(i => i.image_url) || [];
            const removedImages = oldImageUrls.filter(url => !images.includes(url));

            // Delete orphaned files from disk
            for (const url of removedImages) {
                await deleteAssetFromDisk(url);
            }

            await supabase.from('wallpaper_images').delete().eq('wallpaper_id', id);
            const imageInserts = images.map((url, index) => ({
                wallpaper_id: id,
                image_url: url,
                position: index + 1
            }));
            await supabase.from('wallpaper_images').insert(imageInserts);
        }

        // 2.1 Sync Videos & Cleanup Orphans
        if (videos) {
            const oldVideoUrls = oldWallpaper?.videos?.map(v => v.video_url) || [];
            const removedVideos = oldVideoUrls.filter(url => !videos.includes(url));

            for (const url of removedVideos) {
                await deleteAssetFromDisk(url);
            }

            await supabase.from('wallpaper_videos').delete().eq('wallpaper_id', id);
            const videoInserts = videos.map((url, index) => ({
                wallpaper_id: id,
                video_url: url,
                position: index + 1
            }));
            await supabase.from('wallpaper_videos').insert(videoInserts);
        }

        // 2.2 Cleanup Old Swatch if changed
        if (wallpaperData.swatch && oldWallpaper?.swatch !== wallpaperData.swatch) {
            await deleteAssetFromDisk(oldWallpaper?.swatch);
        }

        // 3. Sync Categories
        if (category_ids) {
            await supabase.from('wallpaper_categories').delete().eq('wallpaper_id', id);
            const catInserts = category_ids.map(cid => ({
                wallpaper_id: id,
                category_id: cid
            }));
            await supabase.from('wallpaper_categories').insert(catInserts);
        }

        // 4. Sync Groups
        if (group_ids) {
            await supabase.from('wallpaper_groups').delete().eq('wallpaper_id', id);
            const groupInserts = group_ids.map(gid => ({
                wallpaper_id: id,
                group_id: gid
            }));
            await supabase.from('wallpaper_groups').insert(groupInserts);
        }

        // 5. Sync Books
        if (book_ids) {
            await supabase.from('book_wallpapers').delete().eq('wallpaper_id', id);
            const bookInserts = book_ids.map(bid => ({
                wallpaper_id: id,
                book_id: bid
            }));
            await supabase.from('book_wallpapers').insert(bookInserts);
        }

        res.status(200).json({ message: 'Wallpaper updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteWallpaper = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Fetch info for disk cleanup before deleting from DB
        const { data: wallpaper } = await supabase
            .from('wallpapers')
            .select('design_code')
            .eq('id', id)
            .single();

        // 2. Cascade delete in DB
        const { error } = await supabase.from('wallpapers').delete().eq('id', id);
        if (error) throw error;

        // 3. Delete entire directory from VPS disk
        if (wallpaper?.design_code) {
            const uploadRootEnv = process.env.UPLOAD_ROOT || '/var/www/stenna/public/wallpaper';

            let uploadRoot = uploadRootEnv;
            if (!fs.existsSync(path.parse(uploadRootEnv).root) && process.env.NODE_ENV === 'development') {
                uploadRoot = path.resolve(process.cwd(), 'public', 'wallpaper');
            }

            const targetDir = path.resolve(uploadRoot, wallpaper.design_code);
            if (fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true, force: true });
                console.log(`Self-Cleaning: Deleted entire directory for ${wallpaper.design_code}: ${targetDir}`);
            }
        }

        res.status(200).json({ message: 'Wallpaper and all associated files deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        const { data, error } = await supabase.from('wallpapers').update({ is_active }).eq('id', id).select();
        if (error) throw error;
        res.status(200).json({ message: 'Status updated successfully', data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkUpdateQuantity = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const stream = Readable.from(req.file.buffer);

        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                const summary = {
                    total: results.length,
                    updated: 0,
                    failed: 0,
                    errors: []
                };

                for (const row of results) {
                    // Handle various possible column names
                    const designCode = row['design code'] || row['design_code'] || row['Design Code'] || row['design_code'];
                    const quantity = parseInt(row['quantity'] || row['Quantity']);

                    if (!designCode || isNaN(quantity)) {
                        summary.failed++;
                        summary.errors.push({ row, error: 'Missing design code or invalid quantity' });
                        continue;
                    }

                    try {
                        const { data, error } = await supabase
                            .from('wallpapers')
                            .update({ quantity: quantity })
                            .eq('design_code', designCode)
                            .select();

                        if (error) throw error;

                        if (data && data.length > 0) {
                            summary.updated++;
                        } else {
                            summary.failed++;
                            summary.errors.push({ designCode, error: 'Design code not found' });
                        }
                    } catch (err) {
                        summary.failed++;
                        summary.errors.push({ designCode, error: err.message });
                    }
                }

                res.status(200).json({
                    message: 'Bulk update processed',
                    summary
                });
            });
    } catch (error) {
        console.error('Bulk Update Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const bulkCreateWallpapers = async (req, res) => {
    try {
        const { wallpapers } = req.body;
        if (!wallpapers || !Array.isArray(wallpapers)) {
            return res.status(400).json({ message: 'Invalid wallpapers data' });
        }

        // 1. Fetch all groups and categories for name resolution
        const { data: allGroups } = await supabase.from('category_groups').select('id, name');
        const { data: allCategories } = await supabase.from('categories').select('id, name');

        const groupMap = Object.fromEntries(allGroups.map(g => [g.name.toLowerCase(), g.id]));
        const categoryMap = Object.fromEntries(allCategories.map(c => [c.name.toLowerCase(), c.id]));

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const data of wallpapers) {
            try {
                const { images, videos, category_names, group_names, ...wallpaperData } = data;

                // 2. Resolve Group IDs
                const group_ids = (group_names || []).map(name => groupMap[name.toLowerCase().trim()]).filter(Boolean);

                // 3. Resolve Category IDs
                const category_ids = (category_names || []).map(name => categoryMap[name.toLowerCase().trim()]).filter(Boolean);

                // 4. Create or update wallpaper
                const { data: wallpaper, error: wError } = await supabase
                    .from('wallpapers')
                    .upsert(wallpaperData, { onConflict: 'design_code' })
                    .select()
                    .single();

                if (wError) throw wError;

                // 5. Handle Images
                if (images && images.length > 0) {
                    await supabase.from('wallpaper_images').delete().eq('wallpaper_id', wallpaper.id);
                    const imageInserts = images.map((url, index) => ({
                        wallpaper_id: wallpaper.id,
                        image_url: url,
                        position: index + 1
                    }));
                    await supabase.from('wallpaper_images').insert(imageInserts);
                }

                // 6. Handle Videos
                if (videos && videos.length > 0) {
                    await supabase.from('wallpaper_videos').delete().eq('wallpaper_id', wallpaper.id);
                    const videoInserts = videos.map((url, index) => ({
                        wallpaper_id: wallpaper.id,
                        video_url: url,
                        position: index + 1
                    }));
                    await supabase.from('wallpaper_videos').insert(videoInserts);
                }

                // 7. Handle Categories
                if (category_ids.length > 0) {
                    await supabase.from('wallpaper_categories').delete().eq('wallpaper_id', wallpaper.id);
                    const catInserts = category_ids.map(id => ({
                        wallpaper_id: wallpaper.id,
                        category_id: id
                    }));
                    await supabase.from('wallpaper_categories').insert(catInserts);
                }

                // 8. Handle Groups
                if (group_ids.length > 0) {
                    await supabase.from('wallpaper_groups').delete().eq('wallpaper_id', wallpaper.id);
                    const grpInserts = group_ids.map(id => ({
                        wallpaper_id: wallpaper.id,
                        group_id: id
                    }));
                    await supabase.from('wallpaper_groups').insert(grpInserts);
                }

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ design_code: data.design_code, error: err.message });
            }
        }

        res.status(200).json({
            message: 'Bulk upload completed',
            summary: results
        });
    } catch (error) {
        console.error('Bulk Create Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const currentId = req.params.id;

        // 1. Fetch current wallpaper's categories with group names
        const { data: currentCatRows, error: e1 } = await supabase
            .from('wallpaper_categories')
            .select(`
                category_id,
                category:categories (
                    id,
                    slug,
                    group:category_groups ( name )
                )
            `)
            .eq('wallpaper_id', currentId);

        if (e1) throw e1;

        if (!currentCatRows?.length) {
            return res.json({ recommendations: [] });
        }

        // 2. Map categories by group: { style: uuid, color: uuid, room: uuid }
        const currentCats = {};
        const categoryIds = [];

        for (const row of currentCatRows) {
            const groupName = row.category?.group?.name?.toLowerCase();
            const catId = row.category_id;
            if (groupName) currentCats[groupName] = catId;
            categoryIds.push(catId);
        }

        // 3. Fetch all wallpaper IDs sharing at least one category
        const { data: candidateRows, error: e2 } = await supabase
            .from('wallpaper_categories')
            .select('wallpaper_id, category_id')
            .in('category_id', categoryIds)
            .neq('wallpaper_id', currentId);

        if (e2) throw e2;
        if (!candidateRows?.length) return res.json({ recommendations: [] });

        // 4. Group candidate categories by wallpaper_id
        const candidateMap = {};
        for (const row of candidateRows) {
            if (!candidateMap[row.wallpaper_id]) candidateMap[row.wallpaper_id] = [];
            candidateMap[row.wallpaper_id].push(row.category_id);
        }

        // 5. Fetch full category details for all candidate category IDs to get group names
        const allCandidateCatIds = [...new Set(candidateRows.map(r => r.category_id))];
        const { data: catDetails, error: e3 } = await supabase
            .from('categories')
            .select('id, group:category_groups ( name )')
            .in('id', allCandidateCatIds);

        if (e3) throw e3;

        // category_id -> group_name lookup
        const catGroupMap = {};
        for (const cat of catDetails) {
            catGroupMap[cat.id] = cat.group?.name?.toLowerCase();
        }

        // 6. Build { style, color, room } map per candidate wallpaper
        const candidateCatsMap = {};
        for (const [wallpaperId, catIds] of Object.entries(candidateMap)) {
            candidateCatsMap[wallpaperId] = {};
            for (const catId of catIds) {
                const groupName = catGroupMap[catId];
                if (groupName) candidateCatsMap[wallpaperId][groupName] = catId;
            }
        }

        // 7. Score, filter, sort, slice top 8
        const scored = Object.entries(candidateCatsMap)
            .map(([wallpaperId, cats]) => ({
                wallpaper_id: wallpaperId,
                score: scoreWallpaper(currentCats, cats),
            }))
            .filter(w => w.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

        if (scored.length === 0) return res.json({ recommendations: [] });

        // 8. Fetch full wallpaper details for top results
        const topIds = scored.map(s => s.wallpaper_id);
        const { data: wallpapers, error: e4 } = await supabase
            .from('wallpapers')
            .select(`
                *,
                images:wallpaper_images(*)
            `)
            .in('id', topIds);

        if (e4) throw e4;

        // 9. Merge score back, preserve ranked order, and RANDOMIZE within same scores
        // Actually, the user wants variety, so let's just shuffle the final 8 for now as they asked.
        const scoreById = Object.fromEntries(scored.map(s => [s.wallpaper_id, s.score]));
        const recommendations = wallpapers
            .map(w => ({
                ...w,
                score: scoreById[w.id],
                images: w.images?.sort((a, b) => a.position - b.position) || []
            }))
            .sort((a, b) => b.score - a.score);

        // Simple Fisher-Yates shuffle for the final list to satisfy user's variety request
        for (let i = recommendations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [recommendations[i], recommendations[j]] = [recommendations[j], recommendations[i]];
        }

        res.json(recommendations);

    } catch (err) {
        console.error('Recommendations Error:', err);
        res.status(500).json({ error: err.message });
    }
};

