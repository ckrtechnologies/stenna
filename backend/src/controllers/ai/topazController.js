import kieAiService from '../../services/kieAiService.js';

/**
 * Handle Topaz Image Upscaling
 */
export const createUpscaleTask = async (req, res) => {
    try {
        const { image_url, upscale_factor = "2", ...options } = req.body;

        if (!image_url) {
            return res.status(400).json({ message: 'image_url is required' });
        }

        const data = await kieAiService.createTask("topaz/image-upscale", {
            image_url,
            upscale_factor: String(upscale_factor)
        }, options);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Status for Any Task
 * Since KIE uses a unified recordInfo endpoint, we can use this for all tasks
 */
export const getTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.query;
        if (!taskId) return res.status(400).json({ message: 'taskId is required' });

        const data = await kieAiService.getTaskStatus(taskId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
