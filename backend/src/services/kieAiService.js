import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service to handle AI-powered room visualization using Kie AI (Nano Banana).
 */
class KieAiService {
    constructor() {
        this.apiKey = process.env.KIE_AI_API_KEY || '';
        this.apiUrl = process.env.KIE_AI_API_URL || 'https://api.kie.ai/api/v1/jobs/createTask';
        this.statusUrl = 'https://api.kie.ai/api/v1/jobs/recordInfo';
    }

    /**
     * Generates a visualization using the Nano Banana Edit model.
     * @param {string} roomImageUrl - URL of the uploaded room image.
     * @param {string} wallpaperUrl - URL of the wallpaper texture to apply.
     * @param {string} prompt - Custom instructions for the AI.
     */


    async generateEdit(roomImageUrl, wallpaperUrl, prompt = '') {
        try {
            if (!this.apiKey) {
                throw new Error("Stenna API Key is missing. Please add KIE_AI_API_KEY to your .env file.");
            }
            console.log("Stenna AI Service Request:", { wallpaperUrl, roomImageUrl });
            const defaultPrompt = `You are a professional interior visualization AI. Take Image 1 (a photo of a room) ${wallpaperUrl} and apply Image 2 (a wallpaper design) ${roomImageUrl} realistically onto the walls of the room. Ensure the wallpaper aligns perfectly with the room’s perspective, lighting, and shadows. Maintain natural depth and textures, keeping all furniture, windows, and decor fully visible without incorrect overlaps. analyze the wall dimensions then put the wallpaper as tiles without borders of tiles.
`;
            const finalPrompt = prompt || defaultPrompt;
            console.log("wallpaper url : ", wallpaperUrl)
            console.log("room image url : ", roomImageUrl)
            console.log("Stenna AI: Creating transformation task... prompt : ", finalPrompt);
            const response = await axios.post(
                this.apiUrl,
                {
                    model: "google/nano-banana-edit",
                    input: {
                        prompt: finalPrompt,
                        image_urls: [wallpaperUrl, roomImageUrl],
                        output_format: "png",
                        image_size: "1:1"
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Stenna AI Task Creation Error:", error.response?.data || error.message);
            throw new Error(`Stenna AI Task Creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Helper to poll until task is complete.
     */
    async waitForTaskCompletion(taskId) {
        const maxAttempts = 40; // Increased patience
        const delay = 2000;

        for (let i = 0; i < maxAttempts; i++) {
            const status = await this.getTaskStatus(taskId);
            const state = status.data?.state || status.state;

            console.log(`Stenna Task ${taskId} [Attempt ${i + 1}]: ${state}`);

            if (state === 'success') {
                let results = status.data?.resultJson || status.resultJson;
                console.log("Stenna AI Result Raw Data:", results);

                // Handle stringified JSON inside status.data.resultJson
                if (typeof results === 'string' && (results.startsWith('{') || results.startsWith('['))) {
                    try {
                        results = JSON.parse(results);
                        console.log("Stenna AI Parsed Result Detail:", results);
                    } catch (e) {
                        console.warn("Stenna AI: Failed to parse resultJson string.", e.message);
                    }
                }

                // Robust Scavenger logic to find the URL
                let url = null;

                // 1. Check known keys (added 'resultUrls' for camelCase support)
                const potentialKeys = ['resultUrls', 'resulturls', 'result_urls', 'images', 'output', 'url'];
                for (const key of potentialKeys) {
                    const val = results?.[key];
                    if (val) {
                        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
                            url = val[0];
                            break;
                        } else if (typeof val === 'string' && !val.trim().startsWith('{')) {
                            url = val;
                            break;
                        }
                    }
                }

                // 2. If still null, deep search for any string that looks like a clean URL
                if (!url && results) {
                    const searchForUrl = (obj) => {
                        // Strictly match URLs and ignore JSON chunks
                        if (typeof obj === 'string' &&
                            obj.startsWith('http') &&
                            !obj.includes('{"') &&
                            !obj.startsWith('{')) return obj;

                        if (typeof obj !== 'object' || obj === null) return null;
                        for (const key in obj) {
                            const result = searchForUrl(obj[key]);
                            if (result) return result;
                        }
                        return null;
                    };
                    url = searchForUrl(results);
                }

                console.log("Stenna Extracted URL:", url);
                return { url, fullResponse: status };
            }

            if (state === 'fail') {
                console.error("Stenna AI Failed:", status);
                throw new Error("Stenna transformation failed.");
            }

            await new Promise(res => setTimeout(res, delay));
        }

        throw new Error("Stenna transformation timed out. Please try a clearer room photo.");
    }

    /**
     * Polls the status of a Kie AI task.
     * @param {string} taskId - The ID of the task to check.
     */
    async getTaskStatus(taskId) {
        try {
            const response = await axios.get(`${this.statusUrl}?taskId=${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Kie AI Status Error:", error.response?.data || error.message);
            throw error;
        }
    }
}

export default new KieAiService();