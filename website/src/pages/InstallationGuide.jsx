import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import '../styles/StaticPages.css';
import '../styles/CatalogLayout.css';

const InstallationGuide = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Wallpaper Installation Guide | Stenna';
    }, []);

    const tools = [
        { name: "Premium Adhesive", desc: "Use high-quality clear wallpaper paste." },
        { name: "Plumb Line / Spirit Level", desc: "Crucial for drawing a perfectly straight vertical starting line." },
        { name: "Smoothing Brush / Tool", desc: "A felt roller or plastic smoother to remove air bubbles." },
        { name: "Sharp Utility Knife", desc: "Change blades frequently for clean, non-frayed cuts." },
        { name: "Measuring Tape & Pencil", desc: "For measuring heights and marking references." },
        { name: "Damp Sponge & Clean Water", desc: "To immediately wipe away excess adhesive from seams." }
    ];

    const steps = [
        {
            num: "01",
            title: "Prepare the Wall Surface",
            content: "Ensure the wall is completely clean, dry, structural, and flat. Remove old wallpaper, sand down rough imperfections, fill cracks, and seal with a high-quality wallpaper primer/sealer. For best results, prime walls 24 hours before hanging."
        },
        {
            num: "02",
            title: "Establish a Plumb Line",
            content: "Do not rely on corners or door frames as they are rarely perfectly straight. Measure out from the corner of the wall (width of the wallpaper minus 1 inch) and use a spirit level or plumb line to draw a vertical pencil line from ceiling to floor."
        },
        {
            num: "03",
            title: "Paste the Wall",
            content: "Stenna wallpapers are premium non-woven 'Paste-the-Wall' designs. Using a paint roller or paste brush, apply a generous, even layer of wallpaper adhesive directly onto the wall surface, covering slightly more than one strip's width at a time."
        },
        {
            num: "04",
            title: "Hang and Position",
            content: "Carefully align the first vertical strip against your pencil plumb line, leaving 2-3 inches of excess wallpaper at both the ceiling and baseboard. Smooth out bubbles starting from the center and pushing outward using a wallpaper smoother."
        },
        {
            num: "05",
            title: "Pattern Match & Seam Join",
            content: "Slide the next strip edge-to-edge against the first, matching the design pattern carefully at eye level. Avoid overlapping edges. Press seams flat with a seam roller, and gently wipe away excess paste immediately with a clean, damp sponge."
        },
        {
            num: "06",
            title: "Trim the Excess",
            content: "Use a straight edge (like a smoothing trowel) and a sharp utility knife to trim excess wallpaper at the ceiling and floor. Switch knife blades frequently to avoid tearing the wet wallpaper."
        }
    ];

    return (
        <div className="catalog-page fade-in-up" style={{ paddingTop: 0 }}>
            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'INSTALLATION GUIDE' }]}
                    showFilters={false}
                />

                <div className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div className="static-page fade-in-up" style={{ padding: '2rem 5%' }}>
                        <header className="static-page-header">
                            <h3>Wallpaper Installation Guide</h3>
                        </header>

                        {/* Intro */}
                        <section className="static-content-section" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'left' }}>
                            <p className="static-text" style={{ fontSize: '1rem', color: '#333', lineHeight: '1.8', textAlign: 'left', fontStyle: 'italic', marginBottom: '2rem' }}>
                                Hanging wallpaper is a rewarding, transformative experience. Stenna premium non-woven wallpapers use modern 'Paste-the-Wall' technology, making installation clean and accessible. Follow our detailed step-by-step guide below for a professional, seamless finish.
                            </p>
                        </section>

                        {/* Tools Required */}
                        <section className="static-content-section" style={{ maxWidth: '800px', margin: '0 auto 4rem auto', textAlign: 'left' }}>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Required Tools & Materials</h4>
                            <div className="static-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', display: 'grid' }}>
                                {tools.map((t, idx) => (
                                    <div key={idx} style={{ padding: '1.25rem', border: '1px solid #f0f0f0', background: '#fff' }}>
                                        <h5 style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>{t.name}</h5>
                                        <p style={{ fontSize: '0.7rem', color: '#666', margin: 0, lineHeight: '1.4' }}>{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Installation Steps */}
                        <section className="static-content-section" style={{ maxWidth: '800px', margin: '0 auto 4rem auto', textAlign: 'left' }}>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '2.5rem' }}>Step-by-Step Installation</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                {steps.map((s, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: '300', color: '#ccc', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                                            {s.num}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', margin: '0 0 0.75rem 0', color: '#000' }}>
                                                {s.title}
                                            </h5>
                                            <p style={{ fontSize: '0.8rem', color: '#555', margin: 0, lineHeight: '1.6' }}>
                                                {s.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Professional Installation Banner */}
                        <section className="static-content-section" style={{ 
                            textAlign: 'center', 
                            marginTop: '6rem', 
                            maxWidth: '800px', 
                            margin: '6rem auto 2rem auto', 
                            padding: '3rem 2rem', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0' 
                        }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Prefer Professional Installation?</h4>
                            <p className="static-text" style={{ marginBottom: '2rem', color: '#666', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                                Stenna offers a professional, hassle-free installation service with a 3-year installation guarantee. Book an appointment today and have our experts furnish your space.
                            </p>
                            <Link to="/contact" className="btn-zara-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '1rem 3rem' }}>
                                BOOK INSTALLATION APPOINTMENT
                            </Link>
                        </section>
                    </div>
                    <Footer style={{ marginTop: '0', borderTop: '1px solid #f0f0f0' }} />
                </div>

                <SidebarRight 
                    searchQuery={searchQuery} 
                    onSearchChange={setSearchQuery} 
                    user={user}
                />
            </div>
        </div>
    );
};

export default InstallationGuide;
