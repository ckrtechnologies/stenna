import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    Globe,
    Star,
    Layers,
    Sparkles,
    Layout,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { fetchGroups } from '../services/api';
import FloatingProductBar from '../components/FloatingProductBar';
import '../styles/Home.css';

const Home = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadGroups = async () => {
            try {
                const data = await fetchGroups();
                setGroups(data);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoading(false);
            }
        };
        loadGroups();
    }, []);

    // Curated high-end fallback images for Zara aesthetic
    const fallbackImages = [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e5252c35a93?auto=format&fit=crop&q=80'
    ];

    return (
        <div className="home-page">
            <div className="zara-container">
                {/* 01. HERO SECTION */}
                {/* <section className="hero-minimal-v2 zara-hero">
                    <div className="hero-content">
                        <span className="zara-label">STENNA COLLECTION</span>
                        <h1 className="zara-hero-title">PURE <br /> MATERIALITY.</h1>
                        <Link to="/catalog" className="btn-zara-outline">ENTER ARCHIVE</Link>
                    </div>
                </section> */}


                {/* DYNAMIC GROUPS SECTIONS */}
                {loading ? (
                    <div style={{ padding: '10rem', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', color: '#000', fontWeight: '800' }}>
                        Loading Collections...
                    </div>
                ) : (
                    groups.map((group, index) => (
                        <section key={group.id} className="zara-section">
                            <div className="zara-content-block">
                                <span className="section-label" style={{ color: '#000', fontWeight: '900' }}>
                                    COLLECTION No. {index + 1} &mdash; {group.name}
                                </span>
                                <h2 style={{ fontWeight: '900' }}>
                                    {group.name.split(' ').map((word, i) => (
                                        <React.Fragment key={i}>
                                            {word} {i === 0 && <br />}
                                        </React.Fragment>
                                    ))}
                                </h2>
                                <p style={{ color: '#000', fontWeight: '500' }}>
                                    {group.description || "Discover the essence of architectural purity with our hand-curated collection of premium wall coverings."}
                                </p>
                                <div className="infographic-points" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: '600' }}>
                                        <ChevronRight size={14} /> <span>Hand-crafted textures</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: '600' }}>
                                        <ChevronRight size={14} /> <span>Sustainable premium materials</span>
                                    </div>
                                </div>
                                <Link to={`/catalog?group=${group.id}`} className="btn-zara-link" style={{ fontWeight: '800' }}>
                                    Explore {group.name} Collection <ArrowRight size={14} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                                </Link>
                            </div>
                            <div
                                className="zara-visual-block"
                                style={{
                                    backgroundImage: `url(${group.image_url || fallbackImages[index % fallbackImages.length]})`
                                }}
                            >
                                <div className="visual-block-overlay"></div>
                            </div>
                        </section>
                    ))
                )}

                {/* FOOTER VALUES
                <section style={{ padding: '10rem 0', textAlign: 'center', borderTop: '1px solid #efefef' }}>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '5rem', letterSpacing: '8px', fontWeight: '300' }}>The Stenna Standard</h2>
                    <div className="grid grid-cols-3" style={{ gap: '5rem', textAlign: 'left', padding: '0 5%' }}>
                        <div>
                            <span className="section-label" style={{ marginBottom: '1rem' }}>QUALITY</span>
                            <h4 style={{ letterSpacing: '2px', marginBottom: '1rem', fontWeight: '800' }}>Italian Heritage</h4>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Artisanal quality produced in the world's most exclusive wallpaper mills in Florence.</p>
                        </div>
                        <div>
                            <span className="section-label" style={{ marginBottom: '1rem' }}>TECH</span>
                            <h4 style={{ letterSpacing: '2px', marginBottom: '1rem', fontWeight: '800' }}>Neural Search</h4>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Next-gen neural discovery engine for perfect pattern matching with proprietary vision algorithms.</p>
                        </div>
                        <div>
                            <span className="section-label" style={{ marginBottom: '1rem' }}>SERVICE</span>
                            <h4 style={{ letterSpacing: '2px', marginBottom: '1rem', fontWeight: '800' }}>White Glove</h4>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Direct consultation services and priority sampling for architects and luxury home-owners.</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '8rem' }}>
                        <Link to="/ai-recommendations" className="btn-zara-solid">Book a Consultation</Link>
                    </div>
                </section> */}

                {/* <FloatingProductBar /> */}
            </div>
        </div>
    );
};

export default Home;
