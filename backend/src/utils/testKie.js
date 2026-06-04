import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    try {
        console.log("Querying wallpaper by design code PT10611...");
        const { data, error } = await supabase
            .from('wallpapers')
            .select('*')
            .eq('design_code', 'PT10611')
            .maybeSingle();

        if (error) {
            console.error("Supabase Error:", error);
            return;
        }
        
        console.log("Wallpaper found:", data);
        
        if (data) {
            console.log("Querying wallpaper_images for:", data.id);
            const { data: images, error: imgErr } = await supabase
                .from('wallpaper_images')
                .select('*')
                .eq('wallpaper_id', data.id);
                
            if (imgErr) {
                console.error("Image Error:", imgErr);
                return;
            }
            
            console.log("Images:", images);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
