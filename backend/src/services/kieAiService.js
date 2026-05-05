import fetch from 'node-fetch';

class KieAiService {
    constructor() {
        this.apiKey = process.env.KIE_API_KEY;
        this.baseUrl = "https://api.kie.ai/api/v1/jobs";
    }

    /**
     * Create a task on KIE.AI
     * @param {string} model - The model name (e.g., "topaz/image-upscale")
     * @param {object} input - Input parameters for the model
     * @param {object} options - Additional job options (e.g., callBackUrl)
     */
    async createTask(model, input, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/createTask`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model,
                    callBackUrl: options.callBackUrl || "https://stenna.ai/api/callback",
                    input,
                    ...options
                })
            });

            return await response.json();
        } catch (error) {
            console.error(`KIE Task Creation Error (${model}):`, error);
            throw new Error(`Failed to create ${model} task`);
        }
    }

    /**
     * Specialized method for Room Visualization (Try it on my wall)
     * Uses Google Nano Banana Edit model
     */
    async generateEdit(roomImageUrl, wallpaperImageUrl) {
        // According to documentation: https://docs.kie.ai/market/google/nano-banana-edit
        // It requires image_urls as an array and a prompt.
        return this.createTask("google/nano-banana-edit", {
            prompt: `Apply the following wallpaper design to the walls in the room image. Wallpaper URL: ${wallpaperImageUrl}. Ensure natural lighting and perspective.`,
            image_urls: [roomImageUrl, wallpaperImageUrl],
            image_size: "auto",
            output_format: "jpeg"
        });
    }

    /**
     * Poll for task completion
     */
    async waitForTaskCompletion(taskId, maxAttempts = 40, interval = 3000) {
        for (let i = 0; i < maxAttempts; i++) {
            const status = await this.getTaskStatus(taskId);
            
            // Check based on KIE.AI actual response structure
            if (status.code === 200) {
                const record = status.data; // recordInfo is often flattened into data
                const state = record?.state || record?.status;
                
                console.log(`Polling Task ${taskId}: State = ${state}`);

                if (state === 'success' || state === 'SUCCESS') {
                    // Extract result URL
                    const resultJsonStr = record.resultJson;
                    if (!resultJsonStr) {
                        console.error("Task success but resultJson is missing:", record);
                        throw new Error("AI Result data missing");
                    }

                    const result = JSON.parse(resultJsonStr);
                    const url = result.resultUrls?.[0] || result.image?.url || result.url;
                    
                    return { status: 'SUCCESS', url, fullResponse: status.data };
                }
                
                if (state === 'fail' || state === 'FAILED') {
                    throw new Error(record.failMsg || record.failReason || 'AI Task Failed');
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error('Task timed out');
    }

    /**
     * Get task status/result
     * @param {string} taskId - The unique task ID
     */
    async getTaskStatus(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/recordInfo?taskId=${taskId}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error(`KIE Status Fetch Error (${taskId}):`, error);
            throw new Error('Failed to fetch task status');
        }
    }

    /**
     * Get account credits
     */
    async getCredits() {
        try {
            const response = await fetch("https://api.kie.ai/api/v1/chat/credit", {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('KIE Credit Fetch Error:', error);
            throw new Error('Failed to fetch KIE credits');
        }
    }
}

export default new KieAiService();