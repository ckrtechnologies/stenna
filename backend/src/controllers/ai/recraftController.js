import kieAiService from '../../services/kieAiService.js';

/**
 * Handle Recraft Crisp Upscale
 */
export const createCrispUpscaleTask = async (req, res) => {
    try {
        const { image_url, ...options } = req.body;

        if (!image_url) {
            return res.status(400).json({ message: 'image_url is required' });
        }

        const data = await kieAiService.createTask("recraft/crisp-upscale", {
            image: image_url
        }, options);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
