import { supabase } from '../config/supabase.js';

/**
 * Middleware to check and limit customer API credits to 100 per day.
 * Admins are bypassed.
 */
export const checkCredits = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role || req.user?.app_metadata?.role || req.user?.user_metadata?.role;

        // Admin users bypass credit constraints
        if (role === 'admin') {
            return next();
        }

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required to use AI features.' });
        }

        const today = new Date().toISOString().split('T')[0];

        // 1. Fetch current daily usage
        const { data: usage, error: fetchError } = await supabase
            .from('user_api_usage')
            .select('hits_count')
            .eq('user_id', userId)
            .eq('usage_date', today)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching user credit usage:', fetchError);
        }

        const hits = usage ? usage.hits_count : 0;

        // Fetch dynamic daily limit from store settings
        const { data: storeInfo, error: storeError } = await supabase
            .from('store_settings')
            .select('daily_ai_credit_limit')
            .maybeSingle();

        if (storeError) {
            console.error('Error fetching store settings for credit limit:', storeError);
        }

        const limit = storeInfo?.daily_ai_credit_limit ?? 100;

        if (hits >= limit) {
            return res.status(429).json({
                message: `Daily credit limit reached. You get ${limit} free AI generations per day. Please try again tomorrow.`
            });
        }

        // 2. Increment daily usage
        const nextHits = hits + 1;
        const { error: upsertError } = await supabase
            .from('user_api_usage')
            .upsert({
                user_id: userId,
                usage_date: today,
                hits_count: nextHits
            }, {
                onConflict: 'user_id,usage_date'
            });

        if (upsertError) {
            console.error('Error updating daily credit usage:', upsertError);
        }

        // 3. Write detailed log
        await supabase
            .from('api_usage_logs')
            .insert({
                user_id: userId,
                endpoint: req.originalUrl
            });

        next();
    } catch (error) {
        console.error('Credit verification middleware error:', error);
        res.status(500).json({ message: 'Internal server error during credit check.' });
    }
};
