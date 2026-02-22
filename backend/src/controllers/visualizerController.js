import { supabase } from '../config/supabase.js';
import kieAiService from '../services/kieAiService.js';
import { v2 as cloudinary } from 'cloudinary';

const formatTimestamp = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${d}-${m}-${y}_${hh}-${mm}-${ss}`;
};

export const uploadRoom = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user?.id || 'guest';
        const timestamp = formatTimestamp();
        const publicId = `${userId}-room-${timestamp}`;
        const folderPath = `visualizer/room`;

        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: folderPath, public_id: publicId, resource_type: 'auto' },
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
            message: 'Room image uploaded to Cloudinary successfully',
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Room Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const applyWallpaper = async (req, res) => {
    const { roomImageUrl, wallpaperId, generatedImageUrl, maskData, settings } = req.body;
    const userId = req.user ? req.user.id : null;

    try {
        const visualizationData = {
            user_id: userId,
            room_image_url: roomImageUrl,
            wallpaper_id: wallpaperId,
            generated_image_url: generatedImageUrl,
            mask_data: maskData,
            settings: settings || {}
        };

        const { data, error } = await supabase.from('visualizations').insert(visualizationData).select();
        if (error) throw error;

        res.status(200).json({ message: 'Visualization saved', data: data[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const generateVisualization = async (req, res) => {
    try {
        const { wallpaperId, roomImageUrl } = req.body;
        const file = req.file;
        const userId = req.user?.id || 'guest';
        const timestamp = formatTimestamp();

        let roomUrl = roomImageUrl;
        let wpUrl = '';

        // 1. Fetch wallpaper image if ID is provided
        if (wallpaperId) {
            const { data: wp, error: wpErr } = await supabase
                .from('wallpaper_images')
                .select('image_url')
                .eq('wallpaper_id', wallpaperId)
                .order('position', { ascending: true })
                .limit(1)
                .single();

            if (wpErr) throw new Error("Failed to find wallpaper image.");
            wpUrl = wp.image_url;
        }

        // 2. If no room URL provided (file upload), upload to Cloudinary with custom naming
        if (!roomUrl) {
            if (!file) {
                return res.status(400).json({ message: 'Room image file or URL is required' });
            }

            const publicId = `${userId}-room-${timestamp}`;
            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'visualizer/room', public_id: publicId, resource_type: 'auto' },
                        (err, result) => result ? resolve(result) : reject(err)
                    );
                    stream.end(buffer);
                });
            };
            const uploadResult = await streamUpload(file.buffer);
            roomUrl = uploadResult.secure_url;
        }

        // 3. AI Transformation Flow
        console.log("Stenna AI: Starting generation for design...");
        const taskResponse = await kieAiService.generateEdit(roomUrl, wpUrl);
        const taskId = taskResponse.data?.taskId || taskResponse.taskId;

        if (!taskId) throw new Error("AI Task initiation failed.");

        const result = await kieAiService.waitForTaskCompletion(taskId);
        const tempGeneratedUrl = result.url;

        if (!tempGeneratedUrl) throw new Error("AI generated an invalid or empty result URL.");

        // 4. PERSISTENCE: Re-upload AI result to Cloudinary with custom naming
        console.log("Stenna AI: Re-uploading AI result to Cloudinary for permanent storage...");
        const outputPublicId = `${userId}-output-${timestamp}`;
        const cloudinaryResult = await cloudinary.uploader.upload(tempGeneratedUrl, {
            folder: 'visualizer/room',
            public_id: outputPublicId,
            resource_type: 'auto'
        });

        const finalGeneratedUrl = cloudinaryResult.secure_url;

        // 5. Save to Database
        let savedVisualization = null;
        if (req.user?.id) {
            const { data: saved, error: saveErr } = await supabase
                .from('visualizations')
                .insert({
                    user_id: req.user.id,
                    wallpaper_id: wallpaperId,
                    room_image_url: roomUrl,
                    generated_image_url: finalGeneratedUrl,
                    settings: { taskId, prompt: result.fullResponse?.input?.prompt, cloudinary_id: cloudinaryResult.public_id }
                })
                .select()
                .single();

            if (saveErr) {
                console.warn("Stenna AI: Result generated but failed to save to history:", saveErr.message);
            } else {
                savedVisualization = saved;
            }
        }

        // 6. Return Final Result
        res.status(200).json({
            message: 'Visualization generated and stored successfully',
            generatedUrl: finalGeneratedUrl,
            originalUrl: roomUrl,
            visualizationId: savedVisualization?.id
        });

    } catch (error) {
        console.error("Visualizer Error:", error);
        res.status(500).json({ error: true, message: error.message });
    }
};

export const editVisualization = async (req, res) => {
    const { id } = req.params;
    const { settings, maskData } = req.body;
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('visualizations')
            .update({ settings, mask_data: maskData })
            .eq('id', id)
            .eq('user_id', userId)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Visualization updated', data: data[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase.from('visualizations').select('*, wallpapers(*)').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
