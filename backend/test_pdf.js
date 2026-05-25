import { supabase } from './src/config/supabase.js';
import puppeteer from 'puppeteer';
import fs from 'fs';

const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const getHeroImage = (images) => {
    if (!images || images.length === 0) return 'https://placehold.co/450x300/f1f5f9/94a3b8?text=No+Image';
    if (images[1]?.image_url) return images[1].image_url;
    if (images[2]?.image_url) return images[2].image_url;
    return images[0].image_url;
};

const generateHTML = (wallpapers, title, subtitle) => {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const tocRows = wallpapers.map((w, idx) => `
        <div class="toc-item">
            <div class="toc-title">
                <span class="toc-code">${w.design_code || 'UNTITLED'}</span>
                <span class="toc-name">${w.name || 'Unnamed Wallpaper'}</span>
            </div>
            <div class="toc-leader"></div>
            <div class="toc-page-num">
                <a href="#wp-${w.id}">Page ${idx + 4}</a>
            </div>
        </div>
    `).join('');

    const gridCards = wallpapers.map(w => {
        const handImg = w.images?.[0]?.image_url || 'https://placehold.co/180x130/f1f5f9/94a3b8?text=?';
        return `
            <a href="#wp-${w.id}" class="grid-card-link">
                <div class="grid-card">
                    <div class="grid-thumb">
                        <img src="${handImg}" alt="${w.name}" />
                    </div>
                    <div class="grid-card-info">
                        <span class="grid-card-code">${w.design_code || 'UNTITLED'}</span>
                        <h4 class="grid-card-name">${w.name || 'Unnamed'}</h4>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    const detailsPages = wallpapers.map((w, idx) => {
        const heroImg = getHeroImage(w.images);
        const priceText = w.price ? `₹${parseFloat(w.price).toLocaleString('en-IN')}` : 'N/A';
        const sizeText = w.roll_width && w.roll_height ? `${w.roll_width} cm x ${w.roll_height} m` : 'Standard Roll';
        
        const thumbnailsHtml = w.images.map((img, i) => `
            <div class="detail-thumb">
                <img src="${img.image_url}" alt="Slot ${i + 1}" />
                <span class="thumb-lbl">${['Hand', 'Med', 'Far', 'Family', 'Book', 'Rustic'][i] || 'Alt'}</span>
            </div>
        `).join('');

        return `
            <div id="wp-${w.id}" class="pdf-page details-page">
                <div class="details-header">
                    <div>
                        <h2 class="details-code">${w.design_code || 'UNTITLED'}</h2>
                        <p class="details-name">${w.name || 'Unnamed Wallpaper'}</p>
                    </div>
                    <div class="details-brand-tag">PORTFOLIO EXCLUSIVE</div>
                </div>
                <div class="details-content">
                    <div class="details-visuals">
                        <div class="details-hero">
                            <img src="${heroImg}" alt="Mockup" />
                        </div>
                        <div class="details-thumbs">
                            ${thumbnailsHtml}
                        </div>
                    </div>
                    <div class="details-info">
                        ${w.tagline ? `<p class="details-tagline">“${w.tagline}”</p>` : ''}
                        <table class="specs-table">
                            <tr><th>Specifications</th><th>Details</th></tr>
                            <tr><td>SRP Price</td><td class="price-val">${priceText}</td></tr>
                            <tr><td>Dimension</td><td>${sizeText}</td></tr>
                            <tr><td>Material</td><td>${w.material || 'Non-woven'}</td></tr>
                            <tr><td>Finish</td><td>${w.finish || 'Matte'}</td></tr>
                            <tr><td>Washability</td><td>${w.washability || 'Washable'}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="details-footer">
                    <span>Page ${idx + 4}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <html>
        <head>
            <style>
                @page { size: A4; margin: 0; }
                body { font-family: sans-serif; margin: 0; padding: 0; }
                .pdf-page { width: 210mm; height: 297mm; padding: 20mm; page-break-after: always; position: relative; overflow: hidden; background: white; }
                .cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .toc-page { padding: 25mm; }
                .toc-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .toc-leader { flex: 1; border-bottom: 1px dotted #ccc; margin: 0 10px; }
                .overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .grid-card { border: 1px solid #ddd; padding: 5px; border-radius: 4px; }
                .grid-thumb { height: 100px; overflow: hidden; }
                .grid-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .details-page { display: flex; flex-direction: column; }
                .details-header { border-bottom: 2px solid #b45309; padding-bottom: 5px; margin-bottom: 10px; }
                .details-content { display: flex; justify-content: space-between; flex: 1; }
                .details-visuals { width: 55%; }
                .details-hero { height: 250px; background: #eee; margin-bottom: 10px; }
                .details-hero img { width: 100%; height: 100%; object-fit: cover; }
                .details-thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
                .detail-thumb img { height: 40px; width: 100%; object-fit: cover; }
                .details-info { width: 40%; }
                .specs-table { width: 100%; border-collapse: collapse; }
                .specs-table th { border-bottom: 1px solid #b45309; text-align: left; }
                .specs-table td { padding: 5px 0; border-bottom: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div id="cover-page" class="pdf-page cover-page">
                <h1>${title}</h1>
                <h3>${subtitle}</h3>
                <p>Date: ${date}</p>
            </div>
            <div id="toc-page" class="pdf-page toc-page">
                <h2>INDEX OF DESIGNS</h2>
                ${tocRows}
            </div>
            <div id="overview-page" class="pdf-page overview-page">
                <h2>COLLECTION OVERVIEW</h2>
                <div class="overview-grid">${gridCards}</div>
            </div>
            ${detailsPages}
        </body>
        </html>
    `;
};

const runTest = async () => {
    console.log("Fetching 175 wallpaper IDs...");
    try {
        const { data: wallpapers, error } = await supabase
            .from('wallpapers')
            .select('id')
            .limit(175);

        if (error) throw error;
        const ids = wallpapers.map(w => w.id);
        console.log(`Fetched ${ids.length} IDs.`);

        const startDb = Date.now();
        const idChunks = chunkArray(ids, 30);
        let allWallpapers = [];
        let allImages = [];
        let allCategories = [];
        let allGroups = [];
        let allBooks = [];

        for (const chunk of idChunks) {
            const [wps, imgs, cats, grps, bks] = await Promise.all([
                supabase.from('wallpapers').select('*').in('id', chunk),
                supabase.from('wallpaper_images').select('*').in('wallpaper_id', chunk),
                supabase.from('wallpaper_categories').select('*, category:categories(*)').in('wallpaper_id', chunk),
                supabase.from('wallpaper_groups').select('*, group:category_groups(*)').in('wallpaper_id', chunk),
                supabase.from('book_wallpapers').select('*, book:books(*)').in('wallpaper_id', chunk)
            ]);

            if (wps.error) throw wps.error;
            if (imgs.error) throw imgs.error;
            if (cats.error) throw cats.error;
            if (grps.error) throw grps.error;
            if (bks.error) throw bks.error;

            allWallpapers = allWallpapers.concat(wps.data);
            allImages = allImages.concat(imgs.data);
            allCategories = allCategories.concat(cats.data);
            allGroups = allGroups.concat(grps.data);
            allBooks = allBooks.concat(bks.data);
        }

        const wallpapersData = allWallpapers.map(w => {
            const wImgs = allImages.filter(img => img.wallpaper_id === w.id).sort((a, b) => a.position - b.position);
            const wCats = allCategories.filter(rel => rel.wallpaper_id === w.id).map(rel => rel.category).filter(Boolean);
            const wGrps = allGroups.filter(rel => rel.wallpaper_id === w.id).map(rel => rel.group).filter(Boolean);
            const wBks = allBooks.filter(rel => rel.wallpaper_id === w.id).map(rel => rel.book).filter(Boolean);

            return {
                ...w,
                images: wImgs,
                categories: wCats,
                groups: wGrps,
                books: wBks
            };
        });

        console.log(`Database chunked fetch complete in ${Date.now() - startDb}ms.`);

        const htmlContent = generateHTML(wallpapersData, "Stenna Test Catalog", "Limited Stock Debug");
        console.log("HTML generated. Launching Puppeteer...");

        const startPdf = Date.now();
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--max-connections-per-host=30' // Optimize downloading parallel connections
            ]
        });

        const page = await browser.newPage();
        await page.emulateMediaType('print');

        console.log("Setting HTML content in Puppeteer with networkidle2 wait...");
        await page.setContent(htmlContent, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });

        console.log("Generating A4 PDF...");
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
        });

        await browser.close();
        const durationPdf = Date.now() - startPdf;
        console.log(`\nSuccess! PDF compiled in ${durationPdf}ms!`);
        console.log(`PDF Buffer Size: ${pdfBuffer.length} bytes`);

        fs.writeFileSync('/Users/chandanmallik/.gemini/antigravity-ide/brain/27db2176-7cd9-4c6e-afb7-8089526630fb/scratch/debug_test.pdf', pdfBuffer);
        console.log("PDF saved to scratch/debug_test.pdf");
        process.exit(0);

    } catch (err) {
        console.error("Test execution failed:", err);
        process.exit(1);
    }
};

runTest();
