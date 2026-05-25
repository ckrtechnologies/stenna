import { supabase } from '../config/supabase.js';
import puppeteer from 'puppeteer';
import fs from 'fs';

// Optimization: if it's the assets domain and we have the local VPS storage directory,
// map it to file:/// so Puppeteer loads it instantly from local SSD in production!
const optimizeImageURL = (url) => {
    if (!url) return 'https://placehold.co/180x130/f1f5f9/94a3b8?text=No+Image';
    if (url.startsWith('https://assets.stenna.cloud/wallpaper') && fs.existsSync('/var/www/stenna/public/wallpaper')) {
        return url.replace('https://assets.stenna.cloud/wallpaper', 'file:///var/www/stenna/public/wallpaper');
    }
    return url;
};

// Helper to choose the best hero visualization image (prefer medium short or far short, fallback to first)
const getHeroImage = (images) => {
    if (!images || images.length === 0) return 'https://placehold.co/450x300/f1f5f9/94a3b8?text=No+Image';
    if (images[1]?.image_url) return images[1].image_url;
    if (images[2]?.image_url) return images[2].image_url;
    return images[0].image_url;
};

// Render A4 PDF Buffer with Puppeteer
const renderPuppeteerPDF = async (htmlContent, wallpaperCount) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--max-connections-per-host=30', // Maximizes parallel downloads
            '--disk-cache-size=268435456'    // Enable 256MB disk cache
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Emulate screen/media print so styles apply correctly
        await page.emulateMediaType('print');
        
        // Set HTML content and wait for basic DOM layout
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

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
            // Race image loading against a generous 60-second safety timeout
            // to ensure completely loaded high-res images on slower/throttled network paths
            const safetyTimeout = new Promise(resolve => setTimeout(resolve, 60000));
            await Promise.race([
                Promise.all(imagePromises),
                safetyTimeout
            ]);
        });

        // Generous 1.5-second safety buffer for browser paint engine to decode and draw images
        await new Promise(r => setTimeout(r, 1500));

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

    // 1. Generate Table of Contents
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

    // 2. Generate Grid overview
    const gridCards = wallpapers.map(w => {
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

    // 3. Generate Details pages
    const detailsPages = wallpapers.map((w, idx) => {
        const heroImg = optimizeImageURL(getHeroImage(w.images));
        
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
                    <a href="#toc-page" class="nav-anchor">← Back to Index Page</a>
                    <a href="#overview-page" class="nav-anchor">← Back to Gallery Grid</a>
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
                    <span>Page ${idx + 4}</span>
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
                .pdf-page {
                    width: 210mm;
                    height: 297mm;
                    padding: 20mm 18mm;
                    page-break-after: always;
                    break-after: page;
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
                    margin: 0 0 10px 0;
                }
                .toc-header-line {
                    width: 60px;
                    height: 2px;
                    background: #b45309;
                    margin: 0 auto;
                }
                .toc-list {
                    margin-top: 10mm;
                    max-height: 200mm;
                    overflow: hidden;
                }
                .toc-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 18px;
                    font-size: 14px;
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
                .toc-page-num a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
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
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                }
                .overview-header-line {
                    width: 60px;
                    height: 2px;
                    background: #b45309;
                    margin: 0 auto;
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
                    height: 280px;
                    width: 100%;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #cbd5e1;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 15px;
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
                    gap: 10px;
                    max-height: 180px;
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
                    height: 52px;
                    width: 100%;
                    object-fit: cover;
                    border-radius: 4px;
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
                    margin-bottom: 15px;
                }
                .specs-table th {
                    text-align: left;
                    font-family: 'Cinzel', serif;
                    font-size: 11px;
                    font-weight: 700;
                    color: #78350f;
                    padding: 6px 0;
                    border-bottom: 1.5px solid #b45309;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .specs-table td {
                    font-size: 11px;
                    padding: 5px 0;
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
                    gap: 10px;
                    flex: 1;
                    overflow: hidden;
                }
                .narrative-box {
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 8px 10px;
                }
                .narrative-box h5 {
                    margin: 0 0 4px 0;
                    font-family: 'Cinzel', serif;
                    font-size: 9px;
                    font-weight: 700;
                    color: #78350f;
                    letter-spacing: 1px;
                }
                .narrative-box p {
                    margin: 0;
                    font-size: 10.5px;
                    color: #475569;
                    line-height: 1.35;
                }
                .narrative-box .desc-para {
                    font-size: 10px;
                    line-height: 1.3;
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

            <!-- PAGE 2: TABLE OF CONTENTS (INDEX) -->
            <div id="toc-page" class="pdf-page toc-page">
                <div class="toc-header">
                    <h2>INDEX OF DESIGNS</h2>
                    <div class="toc-header-line"></div>
                </div>
                <div class="toc-list">
                    ${tocRows}
                </div>
                <div class="toc-footer">
                    <span>TOC • STENNA LUXURY BRAND</span>
                    <span>Page 2</span>
                </div>
            </div>

            <!-- PAGE 3: PORTFOLIO GALLERY OVERVIEW -->
            <div id="overview-page" class="pdf-page overview-page">
                <div class="overview-header">
                    <h2>COLLECTION OVERVIEW</h2>
                    <div class="overview-header-line"></div>
                </div>
                <div class="overview-grid">
                    ${gridCards}
                </div>
                <div class="overview-footer">
                    <span>OVERVIEW • STENNA LUXURY BRAND</span>
                    <span>Page 3</span>
                </div>
            </div>

            <!-- PAGE 4+: WALLPAPER DETAILS PAGES -->
            ${detailsPages}
        </body>
        </html>
    `;
};

// Main Route Request Handler
export const generatePDF = async (req, res) => {
    try {
        const { wallpaperIds, title = 'Stenna Wallpaper Catalog', subtitle = 'Premium Collection' } = req.body;

        if (!wallpaperIds || !Array.isArray(wallpaperIds) || wallpaperIds.length === 0) {
            return res.status(400).json({ message: 'No wallpapers selected. Please choose some wallpapers or collections.' });
        }

        // Chunk queries to avoid HTTP URL/header size limits on self-hosted Nginx gateways
        const chunkArray = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        const idChunks = chunkArray(wallpaperIds, 30);
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

        if (allWallpapers.length === 0) {
            return res.status(404).json({ message: 'No wallpapers found for the selected IDs.' });
        }

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

        // Compile HTML and render A4 PDF
        const htmlContent = generateHTML(wallpapers, title, subtitle);
        const pdfBuffer = await renderPuppeteerPDF(htmlContent, wallpapers.length);

        // Send PDF back to client for dynamic download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=stenna_catalog_${Date.now()}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Puppeteer PDF Generation Error:', err);
        res.status(500).json({ message: err.message || 'An error occurred during Puppeteer PDF generation.' });
    }
};
