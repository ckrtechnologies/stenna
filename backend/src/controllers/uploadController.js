import { v2 as cloudinary } from 'cloudinary';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Direct Upload to VPS for n8n workflows
 * Saves to: /var/www/stenna/public/wallpaper/<design_code>/<original_name>
 */
export const uploadWallpaperToVPS = async (req, res) => {
    try {
        // Support both headers and query parameters (for n8n/browser flexibility)
        const apiKey = req.headers['x-api-key'] || req.query['x-api-key'];
        const envKey = process.env.UPLOAD_API_KEY || 'n8n_stenna_secret_2026';

        if (apiKey !== envKey) {
            console.warn(`Unauthorized VPS upload attempt with key: ${apiKey}`);
            return res.status(401).json({
                message: 'Unauthorized: Invalid API Key',
                hint: 'Include x-api-key in Headers or Query Params'
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { design_code } = req.body;
        if (!design_code) {
            return res.status(400).json({ message: 'design_code is required' });
        }

        const uploadRoot = process.env.UPLOAD_ROOT || '/var/www/stenna/public/wallpaper';
        const targetDir = path.join(uploadRoot, design_code);

        // Ensure directory exists with 0755 permissions (readable by Nginx)
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
        }

        // Generate filename (keeping original name or using timestamp)
        const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(targetDir, filename);

        // Save file with 0644 permissions (standard readable file)
        fs.writeFileSync(filePath, req.file.buffer, { mode: 0o644 });

        // Construct public URL
        const baseUrl = process.env.ASSETS_BASE_URL || 'https://assets.stenna.cloud/wallpaper';
        const publicUrl = `${baseUrl}/${design_code}/${filename}`;

        res.status(200).json({
            message: 'File uploaded to VPS successfully',
            url: publicUrl,
            design_code,
            file: filename
        });
    } catch (error) {
        console.error('VPS Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadWallpaper = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { design_code } = req.body;
        if (!design_code) {
            return res.status(400).json({
                message: 'design_code is required for VPS storage. Please enter a Design Code in the modal first.'
            });
        }

        // 1. VPS Storage Path Logic (Smart Cross-Platform)
        const uploadRootEnv = process.env.UPLOAD_ROOT || '/var/www/stenna/public/wallpaper';

        // If UPLOAD_ROOT doesn't exist (like on Windows local dev), fall back to local public folder
        let uploadRoot = uploadRootEnv;
        if (!fs.existsSync(path.parse(uploadRootEnv).root) && process.env.NODE_ENV === 'development') {
            uploadRoot = path.resolve(process.cwd(), 'public', 'wallpaper');
        }

        const targetDir = path.resolve(uploadRoot, design_code);

        // 2. Ensure directory exists with public permissions
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
        }

        // 3. Generate filename and full path
        const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(targetDir, filename);

        // 4. Save file to disk with readable permissions (0644)
        fs.writeFileSync(filePath, req.file.buffer, { mode: 0o644 });

        // 5. Construct public URL
        const baseUrl = process.env.ASSETS_BASE_URL || 'https://assets.stenna.cloud/wallpaper';
        const publicUrl = `${baseUrl}/${design_code}/${filename}`;

        console.log(`Manual Upload: Successfully saved file to: ${filePath}`);

        res.status(200).json({
            message: 'File uploaded to VPS successfully',
            url: publicUrl,
            design_code,
            file: filename
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Utility: Delete file from VPS disk (cross-platform)
 * Used by deleteFile endpoint and by sync-cleanup logic.
 */
export const deleteAssetFromDisk = async (url) => {
    if (!url || !url.includes('assets.stenna.cloud')) return false;

    try {
        const baseUrl = process.env.ASSETS_BASE_URL || 'https://assets.stenna.cloud/wallpaper';
        const uploadRootEnv = process.env.UPLOAD_ROOT || '/var/www/stenna/public/wallpaper';

        // Smart Pathing (Cross-platform resolution)
        let uploadRoot = uploadRootEnv;
        if (!fs.existsSync(path.parse(uploadRootEnv).root) && process.env.NODE_ENV === 'development') {
            uploadRoot = path.resolve(process.cwd(), 'public', 'wallpaper');
        }

        // Handle both wallpaper and visualizer roots
        if (url.includes('/visualizer/')) {
            const visualizerBase = process.env.VISUALIZER_BASE_URL || 'https://assets.stenna.cloud/visualizer';
            const visualizerRootEnv = process.env.WEB_ROOT || '/var/www/stenna/public';

            let visualizerRoot = visualizerRootEnv;
            if (!fs.existsSync(path.parse(visualizerRootEnv).root) && process.env.NODE_ENV === 'development') {
                visualizerRoot = path.resolve(process.cwd(), 'public');
            }

            const relativePath = url.replace(visualizerBase, '').replace(/^\//, '');
            const filePath = path.resolve(visualizerRoot, 'visualizer', relativePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
        } else {
            // Default Wallpaper Root
            const relativePath = url.replace(baseUrl, '').replace(/^\//, '');
            const filePath = path.resolve(uploadRoot, relativePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Delete Asset Error:', error);
        return false;
    }
};

export const deleteFile = async (req, res) => {
    const { url, public_id } = req.body;
    try {
        // 1. Handle VPS File Deletion (URL-based)
        if (url && url.includes('assets.stenna.cloud')) {
            const success = await deleteAssetFromDisk(url);
            if (success) {
                return res.status(200).json({ message: 'File deleted from VPS successfully' });
            } else {
                return res.status(404).json({ message: 'File not found on VPS disk' });
            }
        }

        // 2. Handle Legacy Cloudinary Deletion
        if (public_id) {
            const { result, error } = await cloudinary.uploader.destroy(public_id);
            if (error || result !== 'ok') {
                throw new Error(error || `Cloudinary delete failed: ${result}`);
            }
            return res.status(200).json({ message: 'File deleted from Cloudinary successfully' });
        }

        res.status(400).json({ message: 'Valid url or public_id is required' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Diagnostic Endpoint: Verify VPS Storage
 * List files in the upload root to confirm they exist on disk.
 */
export const verifyVPS = async (req, res) => {
    try {
        const uploadRoot = process.env.UPLOAD_ROOT || '/var/www/stenna/public/wallpaper';
        const webRoot = process.env.WEB_ROOT || '/var/www/stenna/public';

        if (!fs.existsSync(uploadRoot)) {
            return res.status(404).json({
                error: 'Upload root not found',
                path: uploadRoot,
                suggestion: 'Ensure the folder exists and Node has permission to read it.'
            });
        }

        const folders = fs.readdirSync(uploadRoot);
        const stats = {
            uploadRoot,
            webRoot,
            folderCount: folders.length,
            folders: folders.slice(0, 50), // Sample
            message: 'VPS storage is accessible to Node. If images 404, check Nginx permissions.'
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Verify VPS Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Upload content for AI processing (Topaz, etc.)
 * Saves to: /var/www/stenna/public/content/<module>
 */
export const uploadContentToVPS = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { module = 'topaz' } = req.body; // Default to topaz
        
        // Base path setup
        const webRoot = process.env.WEB_ROOT || '/var/www/stenna/public';
        let uploadRoot = path.join(webRoot, 'content', module);

        // Fallback for local development
        if (!fs.existsSync(path.parse(webRoot).root) && process.env.NODE_ENV === 'development') {
            uploadRoot = path.resolve(process.cwd(), 'public', 'content', module);
        }

        // Ensure directory exists
        if (!fs.existsSync(uploadRoot)) {
            fs.mkdirSync(uploadRoot, { recursive: true, mode: 0o755 });
        }

        // Generate filename
        const filename = `content-${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadRoot, filename);

        // Save file
        fs.writeFileSync(filePath, req.file.buffer, { mode: 0o644 });

        // Construct public URL 
        // We assume assets.stenna.cloud maps to /var/www/stenna/public
        const baseDomain = 'https://assets.stenna.cloud';
        const publicUrl = `${baseDomain}/content/${module}/${filename}`;

        console.log(`Content Upload: Successfully saved to ${filePath}`);

        res.status(200).json({
            message: 'Content uploaded successfully',
            url: publicUrl,
            module,
            filename
        });
    } catch (error) {
        console.error('Content Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

