import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        console.log("Fetching wallpaper '34513-4'...");
        const { data: wallpapers, error: wpErr } = await supabase
            .from('wallpapers')
            .select('*')
            .or('name.eq.34513-4,slug.eq.34513-4');

        if (wpErr) {
            console.error("Error fetching wallpaper:", wpErr);
            return;
        }

        console.log("Found Wallpapers:", wallpapers);

        if (wallpapers && wallpapers.length > 0) {
            const wp = wallpapers[0];
            const { data: images, error: imgErr } = await supabase
                .from('wallpaper_images')
                .select('*')
                .eq('wallpaper_id', wp.id);

            if (imgErr) {
                console.error("Error fetching images:", imgErr);
            } else {
                console.log("Images for wallpaper:", images);
            }
        }
    } catch (err) {
        console.error("Unhandled error:", err);
    }
}

run();
