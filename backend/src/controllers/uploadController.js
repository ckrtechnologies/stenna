import { v2 as cloudinary } from 'cloudinary';
import { supabase } from '../config/supabase.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadWallpaper = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Use Cloudinary stream to upload the memory buffer from Multer
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'wallpapers', resource_type: 'auto' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                stream.end(buffer);
            });
        };

        const result = await streamUpload(req.file.buffer);

        res.status(200).json({
            message: 'File uploaded to Cloudinary successfully',
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteFile = async (req, res) => {
    const { public_id } = req.body;
    try {
        if (!public_id) {
            return res.status(400).json({ message: 'public_id is required' });
        }

        const { result, error } = await cloudinary.uploader.destroy(public_id);

        if (error || result !== 'ok') {
            throw new Error(error || `Cloudinary delete failed: ${result}`);
        }

        res.status(200).json({ message: 'File deleted from Cloudinary' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
