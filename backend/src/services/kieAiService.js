import fetch from 'node-fetch';

class KieAiService {
    constructor() {
        this.baseUrl = "https://api.kie.ai/api/v1/jobs";
    }

    get apiKey() {
        return process.env.KIE_API_KEY;
    }

    /**
     * Upload a file (Buffer or Base64) to KIE.AI temporary storage to get a publicly accessible URL
     * @param {Buffer|string} fileData - File buffer or base64 data
     * @param {string} fileName - File name with extension
     * @param {string} uploadPath - Upload directory (default: 'rooms')
     * @returns {Promise<string>} - Publicly accessible downloadUrl
     */
    async uploadFile(fileData, fileName = 'image.jpg', uploadPath = 'rooms') {
        try {
            const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

            let base64Data = '';
            if (Buffer.isBuffer(fileData)) {
                base64Data = `data:${mimeType};base64,${fileData.toString('base64')}`;
            } else if (typeof fileData === 'string') {
                if (fileData.startsWith('data:')) {
                    base64Data = fileData;
                } else {
                    base64Data = `data:${mimeType};base64,${fileData}`;
                }
            }

            const response = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    base64Data,
                    uploadPath,
                    fileName
                })
            });

            const result = await response.json();
            if ((result.code === 200 || result.success) && result.data?.downloadUrl) {
                console.log(`Stenna AI: Image uploaded to KIE cloud successfully (${fileName}) -> ${result.data.downloadUrl}`);
                return result.data.downloadUrl;
            }
            throw new Error(result.msg || result.message || 'Failed to upload file to KIE.AI');
        } catch (error) {
            console.error('KIE File Upload Error:', error);
            throw error;
        }
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