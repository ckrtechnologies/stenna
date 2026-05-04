import { useState, useEffect } from 'react';
import { fetchRecommendations } from '../services/api';

/**
 * Hook to fetch wallpaper recommendations based on similarity scoring.
 * 
 * @param {string} wallpaperId - The UUID of the wallpaper.
 * @returns {Object} { recommendations, loading, error }
 */
export function useRecommendations(wallpaperId) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!wallpaperId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        fetchRecommendations(wallpaperId)
            .then(data => {
                if (isMounted) {
                    setRecommendations(data || []);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error('Error fetching recommendations:', err);
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
     }, [wallpaperId]);

    return { recommendations, loading, error };
}
