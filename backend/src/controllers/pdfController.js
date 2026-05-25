import { supabase } from '../config/supabase.js';
import puppeteer from 'puppeteer';
import fs from 'fs';

// Memory cache for generated PDF documents
const pdfCache = new Map();

// Auto clean up expired cache entries (older than 10 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [token, item] of pdfCache.entries()) {
        if (now > item.expires) {
            pdfCache.delete(token);
        }
    }
}, 60000);

// Optimization: if it's the assets domain and we have the local VPS storage directory,
// map it to file:/// so Puppeteer loads it instantly from local SSD in production!
const optimizeImageURL = (url) => {
    if (!url) return 'https://placehold.co/180x130/f1f5f9/94a3b8?text=No+Image';
    if (url.startsWith('https://assets.stenna.cloud/wallpaper') && fs.existsSync('/var/www/stenna/public/wallpaper')) {
        return url.replace('https://assets.stenna.cloud/wallpaper', 'file:///var/www/stenna/public/wallpaper');
    }
    return url;
};

// Global helper to chunk array for dynamic paginations
const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

// Helper to choose the best hero visualization image (prefer medium short or far short, fallback to first)
const getHeroImage = (images) => {
    if (!images || images.length === 0) return 'https://placehold.co/450x300/f1f5f9/94a3b8?text=No+Image';
    if (images[1]?.image_url) return images[1].image_url;
    if (images[2]?.image_url) return images[2].image_url;
    return images[0].image_url;
};

// Render A4 PDF Buffer with Puppeteer
const renderPuppeteerPDF = async (htmlContent, wallpaperCount, sendProgress) => {
    sendProgress('initializing_browser', 'Starting headless print engine...', 60);
    const browser = await puppeteer.launch({
        headless: 'new',
        protocolTimeout: 600000, // 10 minutes to prevent CDP call timeouts on heavy page evaluates and prints
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--max-connections-per-host=30', // Maximizes parallel downloads
            '--disk-cache-size=268435456'    // Enable 256MB disk cache
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Remove or increase the default action and navigation timeouts to 10 minutes (600000ms)
        // to handle massive PDF catalog rendering and compiling without timing out
        page.setDefaultTimeout(600000);
        page.setDefaultNavigationTimeout(600000);
        
        // Emulate screen/media print so styles apply correctly
        await page.emulateMediaType('print');
        
        sendProgress('rendering_dom', 'Mounting A4 digital canvas...', 68);
        // Set HTML content and wait for basic DOM layout (set generous 5-minute timeout)
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 300000 });

        sendProgress('loading_images', `Downloading and caching ${wallpaperCount * 7} high-res wallpaper assets...`, 78);
        // Bulletproof image load listener inside headless Chrome context
        await page.evaluate(async () => {
            const images = Array.from(document.querySelectorAll('img'));
            const imagePromises = images.map(img => {
                // If it is already loaded or is a broken image, resolve immediately
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise((resolve) => {
                    img.addEventListener('load', () => resolve());
                    img.addEventListener('error', () => resolve()); // Proceed on broken/404 images to prevent hangs
                });
            });
            // Race image loading against a 120-second (2-minute) safety timeout
            // to ensure completely loaded high-res images on slower/throttled network paths
            const safetyTimeout = new Promise(resolve => setTimeout(resolve, 120000));
            await Promise.race([
                Promise.all(imagePromises),
                safetyTimeout
            ]);
        });

        sendProgress('painting_canvas', 'Rendering high-fidelity page paints...', 85);
        // Generous 1.5-second safety buffer for browser paint engine to decode and draw images
        await new Promise(r => setTimeout(r, 1500));

        sendProgress('exporting_pdf', 'Formatting paginated sheet vectors to binary A4 stream...', 93);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
};

// HTML compilation template
const generateHTML = (wallpapers, title, subtitle) => {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const itemsPerTOCPage = 18; // Safely fits on A4 page without flowing into the absolute footer
    const itemsPerGridPage = 12; // 4 rows of 3 columns, perfect grid layout without cropping

    const numTOCPages = Math.max(1, Math.ceil(wallpapers.length / itemsPerTOCPage));
    const numGridPages = Math.max(1, Math.ceil(wallpapers.length / itemsPerGridPage));
    const detailsStartPage = 1 + numTOCPages + numGridPages + 1; // page 1: cover, then TOC, then Grid, then Details start

    // 1. Generate Table of Contents pages
    const tocChunks = chunkArray(wallpapers, itemsPerTOCPage);
    const tocPagesHtml = tocChunks.map((chunk, pageIdx) => {
        const rowsHtml = chunk.map((w, itemIdx) => {
            const absoluteIdx = pageIdx * itemsPerTOCPage + itemIdx;
            const pageNum = detailsStartPage + absoluteIdx;
            const displayName = (w.name && w.name.trim().toLowerCase() !== (w.design_code || '').trim().toLowerCase()) 
                ? w.name 
                : '';
            return `
                <a href="#wp-${w.id}" class="toc-item-link">
                    <div class="toc-item">
                        <span class="toc-sno">${absoluteIdx + 1}</span>
                        <div class="toc-title">
                            <span class="toc-code">${w.design_code || 'UNTITLED'}</span>
                            ${displayName ? `<span class="toc-name">${displayName}</span>` : ''}
                        </div>
                        <div class="toc-leader"></div>
                        <div class="toc-page-num">Page ${pageNum}</div>
                    </div>
                </a>
            `;
        }).join('');

        const currentPageNum = 2 + pageIdx;
        return `
            <div class="page-wrapper">
                <div id="toc-page-${pageIdx}" class="pdf-page toc-page">
                    <div class="toc-header">
                        <h2>INDEX OF DESIGNS</h2>
                        <p class="toc-sub-header">Page ${pageIdx + 1} of ${numTOCPages}</p>
                        <div class="toc-header-line"></div>
                    </div>
                    <div class="toc-list">
                        ${rowsHtml}
                    </div>
                    <div class="toc-footer">
                        <span>TOC • STENNA LUXURY BRAND</span>
                        <span>Page ${currentPageNum}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 2. Generate Grid Overview pages
    const gridChunks = chunkArray(wallpapers, itemsPerGridPage);
    const gridPagesHtml = gridChunks.map((chunk, pageIdx) => {
        const cardsHtml = chunk.map(w => {
            const handImg = optimizeImageURL(w.images?.[0]?.image_url);
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

        const currentPageNum = 1 + numTOCPages + pageIdx + 1;
        return `
            <div class="page-wrapper">
                <div id="overview-page-${pageIdx}" class="pdf-page overview-page">
                    <div class="overview-header">
                        <h2>COLLECTION OVERVIEW</h2>
                        <p class="overview-sub-header">Page ${pageIdx + 1} of ${numGridPages}</p>
                        <div class="overview-header-line"></div>
                    </div>
                    <div class="overview-grid">
                        ${cardsHtml}
                    </div>
                    <div class="overview-footer">
                        <span>OVERVIEW • STENNA LUXURY BRAND</span>
                        <span>Page ${currentPageNum}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 3. Generate Details pages
    const detailsPages = wallpapers.map((w, idx) => {
        const heroImg = optimizeImageURL(getHeroImage(w.images));
        const pageNum = detailsStartPage + idx;
        
        // Spec fields
        const priceText = w.price ? `₹${parseFloat(w.price).toLocaleString('en-IN')}` : 'N/A';
        const sizeText = w.roll_width && w.roll_height ? `${w.roll_width} cm x ${w.roll_height} m` : 'Standard Roll';
        const materialText = w.material || 'Premium Non-woven';
        const finishText = w.finish || 'Textured Matte';
        const washText = w.washability || 'Highly Washable / Spongeable';
        const durText = w.durability || 'Extra Durable / High Grade';
        const brandText = w.brand || 'Stenna Cloud';
        const originText = w.country || 'Italy';
        const stockText = w.quantity > 0 ? `${w.quantity} Rolls` : 'Out of Stock';

        // Thumbnails list (All 6 images: Hand Image, Medium Short, Far Short, Warm Family, Modal with Book, Rustic)
        const thumbnailsHtml = w.images.map((img, i) => `
            <div class="detail-thumb">
                <img src="${optimizeImageURL(img.image_url)}" alt="Slot ${i + 1}" />
                <span class="thumb-lbl">${['Hand', 'Med', 'Far', 'Family', 'Book', 'Rustic'][i] || 'Alt'}</span>
            </div>
        `).join('');

        return `
            <div class="page-wrapper">
                <div id="wp-${w.id}" class="pdf-page details-page">
                    <div class="details-header">
                        <div>
                            <h2 class="details-code">${w.design_code || 'UNTITLED'}</h2>
                            <p class="details-name">${w.name || 'Unnamed Wallpaper'}</p>
                        </div>
                        <div class="details-brand-tag">STENNA PREMIUM</div>
                    </div>

                    <div class="details-nav-links">
                        <a href="#cover-page" class="nav-anchor">← Back to Cover Page</a>
                        <a href="#toc-page-0" class="nav-anchor">← Back to Index Page</a>
                        <a href="#overview-page-0" class="nav-anchor">← Back to Gallery Grid</a>
                    </div>

                    <div class="details-content">
                        <!-- Left visual panel (55%) -->
                        <div class="details-visuals">
                            <div class="details-hero">
                                <img src="${heroImg}" alt="Mockup" />
                            </div>
                            <div class="details-thumbs-header">PRODUCT GALLERY</div>
                            <div class="details-thumbs">
                                ${thumbnailsHtml || '<p class="no-thumbs">No additional images uploaded.</p>'}
                            </div>
                        </div>

                        <!-- Right specifications & narrative panel (41%) -->
                        <div class="details-info">
                            ${w.tagline ? `<p class="details-tagline">“${w.tagline}”</p>` : ''}

                            <table class="specs-table">
                                <tr><th>Specifications</th><th>Details</th></tr>
                                <tr><td>Suggested Retail Price</td><td class="price-val">${priceText}</td></tr>
                                <tr><td>Roll Dimension</td><td>${sizeText}</td></tr>
                                <tr><td>Material</td><td>${materialText}</td></tr>
                                <tr><td>Finish / Texture</td><td>${finishText}</td></tr>
                                <tr><td>Washability</td><td>${washText}</td></tr>
                                <tr><td>Durability / Care</td><td>${durText}</td></tr>
                                <tr><td>Collection Brand</td><td>${brandText}</td></tr>
                                <tr><td>Country of Origin</td><td>${originText}</td></tr>
                                <tr><td>Current Stock</td><td>${stockText}</td></tr>
                            </table>

                            <div class="narrative-section">
                                ${w.vibe ? `
                                    <div class="narrative-box">
                                        <h5>THE VIBE & ATMOSPHERE</h5>
                                        <p>${w.vibe}</p>
                                    </div>
                                ` : ''}

                                ${w.choose_if ? `
                                    <div class="narrative-box">
                                        <h5>CHOOSE THIS DESIGN IF</h5>
                                        <p>${w.choose_if}</p>
                                    </div>
                                ` : ''}

                                ${w.ideal_for ? `
                                    <div class="narrative-box">
                                        <h5>IDEAL ROOM SETTING</h5>
                                        <p>${w.ideal_for}</p>
                                    </div>
                                ` : ''}

                                ${w.description ? `
                                    <div class="narrative-box">
                                        <h5>DESIGN DESCRIPTION</h5>
                                        <p class="desc-para">${w.description}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="details-footer">
                        <span>STENNA DESIGN CATALOG • ${w.design_code}</span>
                        <span>Page ${pageNum}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
                
                @page {
                    size: A4;
                    margin: 0;
                }
                
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    color: #1e293b;
                    background-color: #ffffff;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                /* A4 Layout Pages */
                /* A4 Layout Page Wrappers to safely separate flex layouts from print pagination */
                .page-wrapper {
                    display: block;
                    page-break-after: always;
                    break-after: page;
                }

                .pdf-page {
                    width: 210mm;
                    height: 297mm;
                    padding: 20mm 18mm;
                    position: relative;
                    overflow: hidden;
                    background: #ffffff;
                }

                /* ════════════════ COVER PAGE ════════════════ */
                .cover-page {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid #d97706;
                    padding: 30mm 20mm;
                    text-align: center;
                }
                .cover-border-inner {
                    border: 2px solid #b45309;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    padding: 25mm 15mm;
                    position: relative;
                }
                .cover-top-tag {
                    font-family: 'Cinzel', serif;
                    font-size: 13px;
                    letter-spacing: 6px;
                    color: #d97706;
                    font-weight: 600;
                }
                .cover-title-group {
                    margin: auto 0;
                }
                .cover-logo-monogram {
                    width: 70px;
                    height: 70px;
                    border: 2px solid #b45309;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 30px auto;
                    font-family: 'Cinzel', serif;
                    font-size: 32px;
                    font-weight: 700;
                    color: #b45309;
                }
                .cover-main-brand {
                    font-family: 'Cinzel', serif;
                    font-size: 46px;
                    font-weight: 400;
                    letter-spacing: 12px;
                    color: #0f172a;
                    margin: 0 0 15px 0;
                    text-transform: uppercase;
                }
                .cover-divider {
                    width: 80px;
                    height: 1px;
                    background: #b45309;
                    margin: 20px auto;
                }
                .cover-title {
                    font-family: 'Cinzel', serif;
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    color: #78350f;
                    margin: 10px 0 5px 0;
                    text-transform: uppercase;
                }
                .cover-subtitle {
                    font-size: 14px;
                    letter-spacing: 2px;
                    color: #64748b;
                    font-weight: 400;
                    text-transform: uppercase;
                }
                .cover-bottom-group {
                    width: 100%;
                }
                .cover-metadata {
                    font-size: 11px;
                    letter-spacing: 3px;
                    color: #94a3b8;
                    font-weight: 600;
                    margin-bottom: 25px;
                    text-transform: uppercase;
                }
                .cover-date {
                    font-size: 13px;
                    color: #475569;
                    font-weight: 500;
                }

                /* ════════════════ TABLE OF CONTENTS PAGE ════════════════ */
                .toc-page {
                    padding: 25mm 22mm;
                }
                .toc-header {
                    text-align: center;
                    margin-bottom: 20mm;
                }
                .toc-header h2 {
                    font-family: 'Cinzel', serif;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: 5px;
                    color: #0f172a;
                    margin: 0;
                }
                .toc-sub-header, .overview-sub-header {
                    font-size: 11px;
                    color: #b45309;
                    margin: 6px 0 0 0;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                }
                .toc-header-line {
                    width: 60px;
                    height: 2px;
                    background: #b45309;
                    margin: 15px auto 0 auto;
                }
                .toc-list {
                    margin-top: 10mm;
                }
                .toc-item-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    width: 100%;
                }
                .toc-item-link:hover {
                    opacity: 0.85;
                }
                .toc-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 18px;
                    font-size: 14px;
                }
                .toc-sno {
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    color: #64748b;
                    width: 35px;
                    flex-shrink: 0;
                    text-align: left;
                }
                .toc-title {
                    display: flex;
                    align-items: flex-end;
                    max-width: 70%;
                }
                .toc-code {
                    font-family: 'Cinzel', serif;
                    font-weight: 700;
                    color: #9a3412;
                    margin-right: 12px;
                    letter-spacing: 1px;
                    font-size: 15px;
                }
                .toc-name {
                    color: #334155;
                    font-weight: 400;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .toc-leader {
                    flex: 1;
                    border-bottom: 1.5px dotted #cbd5e1;
                    margin: 0 10px 4px 10px;
                }
                .toc-page-num {
                    color: #2563eb;
                    font-weight: 600;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                .toc-footer {
                    position: absolute;
                    bottom: 15mm;
                    left: 22mm;
                    right: 22mm;
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: #94a3b8;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 10px;
                    letter-spacing: 1px;
                }

                /* ════════════════ OVERVIEW GRID PAGE ════════════════ */
                .overview-page {
                    padding: 25mm 18mm;
                }
                .overview-header {
                    text-align: center;
                    margin-bottom: 15mm;
                }
                .overview-header h2 {
                    font-family: 'Cinzel', serif;
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    color: #0f172a;
                    margin: 0;
                    text-transform: uppercase;
                }
                .overview-header-line {
                    width: 60px;
                    height: 2px;
                    background: #b45309;
                    margin: 15px auto 0 auto;
                }
                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 5mm;
                }
                .grid-card-link {
                    text-decoration: none;
                    color: inherit;
                }
                .grid-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: border-color 0.2s;
                }
                .grid-thumb {
                    height: 125px;
                    width: 100%;
                    overflow: hidden;
                    background: #cbd5e1;
                }
                .grid-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .grid-card-info {
                    padding: 10px 12px;
                }
                .grid-card-code {
                    font-family: 'Cinzel', serif;
                    font-size: 12px;
                    font-weight: 700;
                    color: #9a3412;
                    letter-spacing: 1px;
                }
                .grid-card-name {
                    margin: 4px 0 0 0;
                    font-size: 12px;
                    color: #334155;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .overview-footer {
                    position: absolute;
                    bottom: 15mm;
                    left: 18mm;
                    right: 18mm;
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: #94a3b8;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 10px;
                    letter-spacing: 1px;
                }

                /* ════════════════ DETAILS PAGE ════════════════ */
                .details-page {
                    padding: 18mm 16mm;
                    display: flex;
                    flex-direction: column;
                }
                .details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    border-bottom: 2px solid #b45309;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .details-code {
                    font-family: 'Cinzel', serif;
                    font-size: 26px;
                    font-weight: 700;
                    color: #78350f;
                    margin: 0;
                    letter-spacing: 2px;
                    line-height: 1;
                }
                .details-name {
                    margin: 4px 0 0 0;
                    font-size: 14px;
                    color: #475569;
                    font-weight: 400;
                }
                .details-brand-tag {
                    font-family: 'Cinzel', serif;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 3px;
                    color: #b45309;
                }
                
                .details-nav-links {
                    font-size: 10.5px;
                    display: flex;
                    justify-content: space-between; /* Stretch controls full content width */
                    align-items: center;
                    width: 100%;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px 14px;
                    margin-top: 5px;
                    margin-bottom: 15px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    font-weight: 600;
                }
                .nav-anchor {
                    color: #b45309;
                    text-decoration: none;
                    font-weight: 700;
                    transition: color 0.2s;
                }
                .nav-anchor:hover {
                    color: #9a3412;
                    text-decoration: underline;
                }

                .details-content {
                    display: flex;
                    justify-content: space-between;
                    flex: 1;
                    height: calc(100% - 60px);
                    margin-bottom: 10px;
                }

                /* Left Side - Visuals (55%) */
                .details-visuals {
                    width: 55%;
                    display: flex;
                    flex-direction: column;
                }
                .details-hero {
                    height: 380px; /* Increased from 280px to maximize visual canvas */
                    width: 100%;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #cbd5e1;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 20px;
                }
                .details-hero img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .details-thumbs-header {
                    font-size: 10px;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .details-thumbs {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                .detail-thumb {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 3px;
                    text-align: center;
                    position: relative;
                }
                .detail-thumb img {
                    height: 75px; /* Increased from 52px to details of alternative views */
                    width: 100%;
                    object-fit: cover;
                    border-radius: 6px;
                }
                .detail-thumb .thumb-lbl {
                    font-size: 8px;
                    color: #64748b;
                    display: block;
                    margin-top: 2px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Right Side - Information (41%) */
                .details-info {
                    width: 41%;
                    display: flex;
                    flex-direction: column;
                }
                .details-tagline {
                    font-style: italic;
                    font-size: 13px;
                    color: #475569;
                    margin: 0 0 15px 0;
                    line-height: 1.4;
                    border-left: 2.5px solid #d97706;
                    padding-left: 10px;
                    font-weight: 400;
                }
                .specs-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .specs-table th {
                    text-align: left;
                    font-family: 'Cinzel', serif;
                    font-size: 12.5px; /* Increased from 11px */
                    font-weight: 700;
                    color: #78350f;
                    padding: 8px 0; /* Spaced out */
                    border-bottom: 1.5px solid #b45309;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .specs-table td {
                    font-size: 12px; /* Increased from 11px */
                    padding: 7px 0; /* Spaced out */
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                }
                .specs-table td:first-child {
                    font-weight: 500;
                    color: #64748b;
                }
                .specs-table td:last-child {
                    text-align: right;
                    font-weight: 600;
                }
                .specs-table .price-val {
                    color: #b45309;
                    font-weight: 700;
                }

                .narrative-section {
                    display: flex;
                    flex-direction: column;
                    gap: 14px; /* Increased box spacing */
                    flex: 1;
                }
                .narrative-box {
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 10px 14px; /* Increased padding */
                }
                .narrative-box h5 {
                    margin: 0 0 6px 0;
                    font-family: 'Cinzel', serif;
                    font-size: 10px; /* Increased header size */
                    font-weight: 700;
                    color: #78350f;
                    letter-spacing: 1px;
                }
                .narrative-box p {
                    margin: 0;
                    font-size: 11.5px; /* Increased text size */
                    color: #475569;
                    line-height: 1.45; /* Increased spacing */
                }
                .narrative-box .desc-para {
                    font-size: 11px; /* Increased text size */
                    line-height: 1.4;
                    margin: 0;
                    color: #475569;
                }

                .details-footer {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: #94a3b8;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 8px;
                    letter-spacing: 1px;
                    font-weight: 500;
                }

                /* PRINT-SPECIFIC CSS RULES OVERRIDES */
                @media print {
                    .details-nav-links {
                        display: flex !important;
                        opacity: 0.8;
                    }
                    body {
                        background: white;
                    }
                }
            </style>
        </head>
        <body>
            <!-- PAGE 1: COVER PAGE -->
            <div class="page-wrapper">
                <div id="cover-page" class="pdf-page cover-page">
                    <div class="cover-border-inner">
                        <span class="cover-top-tag">ARTISAN WALLCOVERINGS</span>
                        <div class="cover-title-group">
                            <div class="cover-logo-monogram">S</div>
                            <h1 class="cover-main-brand">STENNA</h1>
                            <div class="cover-divider"></div>
                            <h2 class="cover-title">${title}</h2>
                            <h3 class="cover-subtitle">${subtitle}</h3>
                        </div>
                        <div class="cover-bottom-group">
                            <p class="cover-metadata">EXCLUSIVE CATALOGUE COLLECTION</p>
                            <span class="cover-date">${date}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PORTFOLIO TABLE OF CONTENTS (INDEX) PAGES -->
            ${tocPagesHtml}

            <!-- PORTFOLIO GALLERY OVERVIEW PAGES -->
            ${gridPagesHtml}

            <!-- PAGE 4+: WALLPAPER DETAILS PAGES -->
            ${detailsPages}
        </body>
        </html>
    `;
};

// Main Route Request Handler (Streaming Progress updates)
export const generatePDF = async (req, res) => {
    // Establish Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendProgress = (status, message, progress, extraData = {}) => {
        res.write(`data: ${JSON.stringify({ status, message, progress, ...extraData })}\n\n`);
    };

    try {
        const { wallpaperIds, title = 'Stenna Wallpaper Catalog', subtitle = 'Premium Collection' } = req.body;

        if (!wallpaperIds || !Array.isArray(wallpaperIds) || wallpaperIds.length === 0) {
            sendProgress('error', 'No wallpapers selected. Please choose some wallpapers or collections.', 0);
            return res.end();
        }

        sendProgress('fetching_db', 'Connecting to database and resolving collections...', 5);

        const idChunks = chunkArray(wallpaperIds, 30);
        let allWallpapers = [];
        let allImages = [];
        let allCategories = [];
        let allGroups = [];
        let allBooks = [];

        const totalChunks = idChunks.length;
        for (let i = 0; i < totalChunks; i++) {
            const chunk = idChunks[i];
            
            // Calculate progress between 5% and 30%
            const chunkProgress = 5 + Math.round((i / totalChunks) * 25);
            sendProgress('fetching_db', `Retrieving collection metadata (batch ${i + 1} of ${totalChunks})...`, chunkProgress);

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

        if (allWallpapers.length === 0) {
            sendProgress('error', 'No wallpapers found for the selected IDs.', 0);
            return res.end();
        }

        sendProgress('structuring_data', 'Reconstructing product relationships in memory...', 35);

        // Flatten and map relationships in memory
        const wallpapers = allWallpapers.map(w => {
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

        sendProgress('compiling_html', 'Compiling A4 luxury paginated layouts...', 45);
        const htmlContent = generateHTML(wallpapers, title, subtitle);

        // Render PDF in Puppeteer with progress notifications
        const pdfBuffer = await renderPuppeteerPDF(htmlContent, wallpapers.length, sendProgress);

        sendProgress('caching_pdf', 'Caching catalog buffer in memory...', 97);
        const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        pdfCache.set(token, {
            buffer: pdfBuffer,
            title: `stenna_catalog_${Date.now()}.pdf`,
            expires: Date.now() + 600000 // 10 minutes cache
        });

        sendProgress('completed', 'Catalog compiled successfully! Initializing download...', 100, { token });
        res.end();
    } catch (err) {
        console.error('Puppeteer PDF Generation Error:', err);
        sendProgress('error', err.message || 'An error occurred during Puppeteer PDF generation.', 0);
        res.end();
    }
};

// Download Cached PDF Request Handler
export const downloadPDF = async (req, res) => {
    try {
        const { token } = req.params;
        const cached = pdfCache.get(token);
        
        if (!cached) {
            return res.status(404).json({ message: 'Download link has expired or is invalid. Please try curating the catalog again.' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${cached.title}`);
        res.send(cached.buffer);

        // Delete from cache to free memory immediately after successful download
        pdfCache.delete(token);
    } catch (err) {
        console.error('PDF Download Error:', err);
        res.status(500).json({ message: 'Failed to retrieve PDF catalog.' });
    }
};
