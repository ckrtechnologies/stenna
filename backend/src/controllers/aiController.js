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
        const { tags, summary, category, description, roomTypeMatch, avoidanceTags } = aiAnalysis;

        console.log("Stenna AI Calculated Vibe:", { tags, summary, category, roomTypeMatch, avoidanceTags });

        // 2. Fetch all active wallpapers with images and category details
        const { data: allWallpapers, error } = await supabase.from('wallpapers').select(`
            *,
            images:wallpaper_images(*),
            categories:wallpaper_categories(category:categories(*))
        `).eq('is_active', true);

        if (error) throw error;

        // 3. Match & Score wallpapers in memory
        const scoredWallpapers = allWallpapers.map(w => {
            let score = 0;
            
            // Check Room Type Match (ideal_for contains roomTypeMatch)
            const roomMatch = roomTypeMatch?.toLowerCase();
            const idealForStr = (w.ideal_for || '').toLowerCase();
            if (roomMatch && idealForStr.includes(roomMatch)) {
                score += 15; // Strong room-type alignment
            }

            // Check category match
            const mainCategory = category?.toLowerCase();
            const categoriesList = w.categories?.map(c => c.category?.name?.toLowerCase()).filter(Boolean) || [];
            if (mainCategory && categoriesList.includes(mainCategory)) {
                score += 10;
            }

            // Match Mood/Design tags against vibe, description, and ideal_for
            const normalizedTags = (tags || []).map(t => t.toLowerCase());
            const vibeStr = (w.vibe || '').toLowerCase();
            const descStr = (w.description || '').toLowerCase();
            const chooseIfStr = (w.choose_if || '').toLowerCase();

            for (const tag of normalizedTags) {
                if (vibeStr.includes(tag) || descStr.includes(tag) || chooseIfStr.includes(tag)) {
                    score += 5;
                }
            }

            // Avoidance penalty (if wallpaper contains avoidance tags)
            const avoidStr = (w.avoid_if || '').toLowerCase();
            const normalizedAvoidTags = (avoidanceTags || []).map(t => t.toLowerCase());
            for (const avoidTag of normalizedAvoidTags) {
                if (avoidStr.includes(avoidTag) || vibeStr.includes(avoidTag)) {
                    score -= 20; // Heavy penalty for avoidance match
                }
            }

            return {
                ...w,
                score
            };
        });

        // 4. Filter, sort, and format results (no limit!)
        const recommendations = scoredWallpapers
            .filter(w => w.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(({ score, ...w }) => ({
                ...w,
                categories: w.categories?.map(c => c.category).filter(Boolean) || [],
                images: w.images?.sort((a, b) => a.position - b.position) || []
            }));

        res.status(200).json({
            summary: summary,
            description: recommendations.length > 0 ? (description || '') : "We couldn't find an exact match for your specific preferences, but here are some popular designs you might love.",
            tags: tags,
            recommendations: recommendations,
            is_fallback: recommendations.length === 0 || !roomTypeMatch
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get available credits from KIE.AI account.
 */
export const getKieCredits = async (req, res) => {
    try {
        const apiKey = process.env.KIE_API_KEY;
        
        if (!apiKey || apiKey === 'your_actual_api_key_here') {
            return res.status(500).json({ message: 'KIE AI API key is not configured' });
        }

        const response = await fetch("https://api.kie.ai/api/v1/chat/credit", {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
            redirect: 'follow'
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('KIE Credit Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch KIE credits' });
    }
};





