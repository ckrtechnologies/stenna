import { supabase } from '../config/supabase.js';
import sharp from 'sharp';
import kieAiService from '../services/kieAiService.js';
import fs from 'fs';
import path from 'path';

const getWebRoot = () => {
    const webRootEnv = process.env.WEB_ROOT || '/var/www/stenna/public';
    if (!fs.existsSync('/var/www') && process.env.NODE_ENV === 'development') {
        return path.resolve(process.cwd(), 'public');
    }
    return webRootEnv;
};

const getVisualizerBaseUrl = () => {
    const baseUrlEnv = process.env.VISUALIZER_BASE_URL || 'https://assets.stenna.cloud/visualizer';
    if (!fs.existsSync('/var/www') && process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 5010;
        return `http://localhost:${port}/public/visualizer`;
    }
    return baseUrlEnv;
};

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
        
        let roomBuffer = req.file.buffer;
        let ext = path.extname(req.file.originalname).toLowerCase();
        let baseName = path.basename(req.file.originalname, ext).replace(/\s+/g, '_');
        let filename = `${userId}-room-${timestamp}-${baseName}`;

        try {
            roomBuffer = await sharp(req.file.buffer).jpeg({ quality: 90 }).toBuffer();
            filename += '.jpg';
        } catch (sharpError) {
            console.warn("Stenna AI: Sharp uploadRoom conversion failed, using original format:", sharpError.message);
            filename += ext;
        }

        // VPS Storage Settings
        const WEB_ROOT = getWebRoot();
        const VISUALIZER_BASE_URL = getVisualizerBaseUrl();

        const targetDir = path.resolve(WEB_ROOT, 'visualizer', 'uploads');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
        }

        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, roomBuffer, { mode: 0o644 });

        const publicUrl = `${VISUALIZER_BASE_URL}/uploads/${filename}`;

        res.status(200).json({
            message: 'Room image uploaded to VPS successfully',
            url: publicUrl,
            filename: filename
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

            if (wpErr) throw new Error("Failed to find wallpaper image: " + wpErr.message);
            wpUrl = wp.image_url;
        }

        // 2. If no room URL provided (file upload), save to VPS
        if (!roomUrl) {
            if (!file) {
                return res.status(400).json({ message: 'Room image file or URL is required' });
            }

            const WEB_ROOT = getWebRoot();
            const VISUALIZER_BASE_URL = getVisualizerBaseUrl();

            let roomBuffer = file.buffer;
            let ext = path.extname(file.originalname).toLowerCase();
            let baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
            let roomFilename = `${userId}-room-${timestamp}-${baseName}`;

            try {
                roomBuffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
                roomFilename += '.jpg';
            } catch (sharpError) {
                console.warn("Stenna AI: Sharp generateVisualization conversion failed, using original format:", sharpError.message);
                roomFilename += ext;
            }

            const roomDir = path.resolve(WEB_ROOT, 'visualizer', 'uploads');
            if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true, mode: 0o755 });

            const roomPath = path.join(roomDir, roomFilename);
            fs.writeFileSync(roomPath, roomBuffer, { mode: 0o644 });
            roomUrl = `${VISUALIZER_BASE_URL}/uploads/${roomFilename}`;
        }

        // 3. AI Transformation Flow
        console.log("Stenna AI: Starting generation for design...", { roomUrl, wpUrl });
        const taskResponse = await kieAiService.generateEdit(roomUrl, wpUrl);
        console.log("Stenna AI: KIE.AI Response:", JSON.stringify(taskResponse));
        const taskId = taskResponse.data?.taskId || taskResponse.taskId;

        if (!taskId) throw new Error("AI Task initiation failed. Response: " + JSON.stringify(taskResponse));

        const result = await kieAiService.waitForTaskCompletion(taskId);
        const tempGeneratedUrl = result.url;

        if (!tempGeneratedUrl) throw new Error("AI generated an invalid or empty result URL.");

        // 4. PERSISTENCE: Save AI result permanently to VPS
        console.log("Stenna AI: Downloading and saving result to VPS for permanent storage...");
        const WEB_ROOT = getWebRoot();
        const VISUALIZER_BASE_URL = getVisualizerBaseUrl();

        const outputFilename = `${userId}-output-${timestamp}.jpg`;
        const resultDir = path.resolve(WEB_ROOT, 'visualizer', 'results');
        if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir, { recursive: true, mode: 0o755 });

        const outputPath = path.join(resultDir, outputFilename);

        const imageRes = await fetch(tempGeneratedUrl);
        if (!imageRes.ok) throw new Error(`Failed to download AI result from ${tempGeneratedUrl}`);
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

        fs.writeFileSync(outputPath, imageBuffer, { mode: 0o644 });

        const finalGeneratedUrl = `${VISUALIZER_BASE_URL}/results/${outputFilename}`;

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
                    settings: { taskId, prompt: result.fullResponse?.input?.prompt, vps_filename: outputFilename }
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
            message: 'Visualization generated and stored successfully on VPS',
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
