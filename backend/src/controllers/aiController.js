import { supabase } from '../config/supabase.js';
import openaiService from '../services/openaiService.js';

/**
 * Controller to handle AI-powered wallpaper recommendations.
 */
export const getRecommendations = async (req, res) => {
    const { answers } = req.body;

    try {
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ message: 'Questionnaire answers are required' });
        }

        // 1. Get Dynamic AI Analysis from OpenAI
        console.log("Stenna AI: Analyzing preferences with OpenAI...");
        const aiAnalysis = await openaiService.recommendWallpaper(answers);
        const { tags, summary, category, description } = aiAnalysis;

        console.log("Stenna AI Calculated Vibe:", { tags, summary, category });

        // 3. Query the database for matching wallpapers
        let query = supabase.from('wallpapers').select(`
            *,
            images:wallpaper_images(*),
            categories:wallpaper_categories(category:categories(*))
        `).eq('is_active', true);

        // --- MATCH STRATEGY ---

        // Apply Mood Tags filter
        let products = [];
        let error = null;

        if (tags && tags.length > 0 || aiAnalysis.roomTypeMatch) {
            try {
                // Normalize for database (everything lowercase)
                const normalizedRoom = aiAnalysis.roomTypeMatch?.toLowerCase();
                const normalizedTags = (tags || []).map(t => t.toLowerCase());

                // Try precision matching first
                let precisionQuery = supabase.from('wallpapers').select(`
                    *,
                    images:wallpaper_images(*),
                    categories:wallpaper_categories(category:categories(*))
                `).eq('is_active', true);

                // Room Type Filter (check both original and lowercase to be safe)
                if (normalizedRoom) {
                    const roomFilter = `ideal_for.cs.["${normalizedRoom}"],ideal_for.cs.["${aiAnalysis.roomTypeMatch}"]`;
                    precisionQuery = precisionQuery.or(roomFilter);
                }

                // Mood Tags Filter
                if (normalizedTags.length > 0) {
                    const moodFilters = normalizedTags.map(tag => `mood_tags.cs.["${tag}"]`).join(',');
                    precisionQuery = precisionQuery.or(moodFilters);
                }

                const result = await precisionQuery.limit(6);
                products = result.data || [];
                error = result.error;
            } catch (err) {
                console.warn("Stenna AI: Precision match failed, falling back...", err.message);
            }
        }

        // --- FALLBACK SEARCH ---
        // If no products found or precision failed, do a broad keyword search
        if (!products.length) {
            console.log("Stenna AI: Broadening search to keywords...");
            let fallbackQuery = supabase.from('wallpapers').select(`
                *,
                images:wallpaper_images(*),
                categories:wallpaper_categories(category:categories(*))
            `).eq('is_active', true);

            // Broaden the search set
            const searchTags = [...new Set([...(tags || []), category, answers.roomType])].filter(Boolean);
            if (searchTags.length > 0) {
                const filterParts = searchTags.map(tag =>
                    `name.ilike.%${tag}%,description.ilike.%${tag}%,design_code.ilike.%${tag}%`
                );
                fallbackQuery = fallbackQuery.or(filterParts.join(','));
            }

            const fallbackResult = await fallbackQuery.limit(6);
            products = fallbackResult.data || [];
            error = fallbackResult.error;
        }

        if (error) throw error;

        res.status(200).json({
            summary: summary,
            description: products.length > 0 ? (description || '') : "We couldn't find an exact match for your specific preferences, but here are some popular designs you might love.",
            tags: tags,
            recommendations: products,
            is_fallback: products.length === 0 || !aiAnalysis.roomTypeMatch
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error);
        res.status(500).json({ message: error.message });
    }
};
