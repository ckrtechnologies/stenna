import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5010/api/v1';

export const fetchGroups = async () => {
    const response = await fetch(`${API_BASE_URL}/groups`);
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
};

export const fetchCategories = async (groupId) => {
    const url = groupId
        ? `${API_BASE_URL}/categories?group_id=${groupId}`
        : `${API_BASE_URL}/categories`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
};

export const fetchWallpapers = async ({ groupIds, categoryIds, search }) => {
    const params = new URLSearchParams();
    if (groupIds && groupIds.length > 0) {
        params.append('group_id', groupIds.join(','));
    }
    if (categoryIds && categoryIds.length > 0) {
        params.append('category_id', categoryIds.join(','));
    }
    if (search) params.append('search', search);
    params.append('activeOnly', 'true');

    const response = await fetch(`${API_BASE_URL}/wallpapers?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch wallpapers');
    return response.json();
};

export const fetchUserQueries = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_BASE_URL}/queries?user_id=${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch queries');
    return response.json();
};

export const fetchWallpaperBySlug = async (slug) => {
    const response = await fetch(`${API_BASE_URL}/wallpapers/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch wallpaper details');
    return response.json();
};

export const generateVisualization = async (formData) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_BASE_URL}/visualizer/generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'AI Generation failed');
    }
    return response.json();
};

export const submitEnquiry = async (enquiryData) => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...enquiryData,
            type: 'enquiry'
        })
    });
    if (!response.ok) throw new Error('Failed to submit enquiry');
    return response.json();
};

export const fetchVisualizationHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_BASE_URL}/visualizer/history`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch visualization history');
    return response.json();
};

export const fetchAiRecommendations = async (answers) => {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
    });
    if (!response.ok) throw new Error('Failed to fetch AI recommendations');
    return response.json();
    return response.json();
};
