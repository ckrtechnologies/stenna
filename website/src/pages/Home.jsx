import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGroups } from '../services/api';
import FloatingProductBar from '../components/FloatingProductBar';
import HeroCarousel from '../components/HeroCarousel';
import Footer from '../components/Footer';
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

    // High-end generated images for collections
    const collectionImages = {
        'Plain & Textured': '/home/cat-plain.png',
        'Nature & Stone': '/home/cat-nature.png',
        'Classic': '/home/cat-classic.png',
        'Modern & Geometrical': '/home/cat-modern.png',
        'Room': '/home/cat-plain.png',
        'Colour': '/home/cat-nature.png',
        'Style': '/home/cat-classic.png',
        'Textures': '/home/cat-modern.png'
    };

    const fallbackImages = [
        '/home/cat-plain.png',
        '/home/cat-nature.png',
        '/home/cat-classic.png',
        '/home/cat-modern.png'
    ];

    return (
        <div className="home-page">
            <div className="zara-container">
                {/* 01. HERO SECTION */}
                <HeroCarousel />

                {/* 02. INSTALLATION VIDEO SECTION */}
                <section className="video-installation-section">
                    <span className="section-label" style={{ justifyContent: 'center' }}>EXPERTISE</span>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 700 }}>Professional Wallpaper Installation</h2>
                    <p style={{ maxWidth: '800px', margin: '0 auto', opacity: '0.6', lineHeight: 1.8 }}>
                        Experience the precision of our master installers. We ensure every seam is invisible and every pattern is perfectly aligned, bringing your vision to life with artisanal care.
                    </p>
                    <div className="video-container">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        >
                            <source src="https://res.cloudinary.com/dqfjrhlrl/video/upload/v1774531281/vid_1_mxl4gs.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </section>

                {/* 03. ECO-FRIENDLY SPLIT SECTION */}
                <section className="eco-friendly-split">
                    <div className="eco-image-side">
                        <img src="/home/eco-forest.png" alt="Eco-friendly Forest" />
                    </div>
                    <div className="eco-text-side">
                        <span className="section-label">SUSTAINABILITY</span>
                        <h2>Stenna Wallpaper Company Prides Itself With The Best Eco-Friendly Products In The World</h2>
                        <p>
                            By establishing a new factory, Stenna wallpaper adopted a water-based ink applying production process for PVC and Duplex wallpaper for the first time in India and is fulfilling advanced eco-friendly management.
                        </p>
                        <Link to="/catalog" className="eco-shop-link">Shop Now</Link>
                    </div>
                </section>

                {/* 04. EVERYTHING YOU NEED */}
                <section className="everything-section">
                    <div className="everything-section-header">
                        <span className="section-label" style={{ justifyContent: 'center' }}>OUR PROMISE</span>
                        <h2>Providing Everything <span>You Need</span></h2>
                        <p style={{ maxWidth: '700px', margin: '1.5rem auto', fontSize: '0.9rem', opacity: 0.6 }}>
                            We leave no stone unturned when it comes to making your home look beautiful. We have got you covered with our best interior design consultants, wall repair experts and color enthusiasts.
                        </p>
                    </div>
                    <div className="everything-grid-v2">
                        <div className="everything-card-v2">
                            <div className="card-image-wrapper">
                                <img src="/home/adhesive.png" alt="Adhesive For Indian Walls" />
                            </div>
                            <h3>Adhesive For Indian Walls</h3>
                            <p>We have manufactured a wallpaper adhesive especially for Indian walls. It gives immediate grab, gives enough working time, and is easy to wipe off.</p>
                        </div>
                        <div className="everything-card-v2">
                            <div className="card-image-wrapper">
                                <img src="/home/warranty.png" alt="3 Years Peel Off Warranty" />
                            </div>
                            <h3>3 Years Peel Off Warranty</h3>
                            <p>We are happy to come and fix any issues that you are currently facing with respect to your wallpaper furnishings. We offer a 3-year guarantee on all installations.</p>
                        </div>
                        <div className="everything-card-v2">
                            <div className="card-image-wrapper">
                                <img src="/home/installation.png" alt="8 Hours Installation" />
                            </div>
                            <h3>8 Hours Installation</h3>
                            <p>Book an appointment and clear all your doubts. Our wallpaper experts are available for a free of cost and in-depth consultation every day.</p>
                        </div>
                    </div>
                </section>

                {/* 05. TECHNIQUES SECTION */}
                <section className="techniques-section-v2">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <span className="section-label" style={{ justifyContent: 'center', color: '#fff' }}>INNOVATION</span>
                        <h2>Techniques That Set Stenna Wallpapers Apart</h2>
                    </div>
                    <div className="techniques-grid-v2">
                        <div className="technique-card-v2">
                            <div className="tech-image-wrapper">
                                <img src="/home/tech-factory.png" alt="World Class Manufacturing Facility" />
                            </div>
                            <h4>World Class Manufacturing Facility</h4>
                            <p>Stenna wallpapers come with the assurance of accuracy from capture to export, consistently and flawlessly.</p>
                        </div>
                        <div className="technique-card-v2">
                            <div className="tech-image-wrapper">
                                <img src="/home/tech-color.png" alt="Colour & Calibration" />
                            </div>
                            <h4>Colour & Calibration</h4>
                            <p>Color is one of our greatest allies. We understand the hues and how they fit with your design theory to achieve mesmerizing results.</p>
                        </div>
                        <div className="technique-card-v2">
                            <div className="tech-image-wrapper">
                                <img src="/home/tech-emboss.png" alt="Embossing Roller" />
                            </div>
                            <h4>Embossing Roller</h4>
                            <p>We take immense pride in our embossing technology, adapted from European counterparts to focus on designs created by global artisans.</p>
                        </div>
                        <div className="technique-card-v2">
                            <div className="tech-image-wrapper">
                                <img src="/home/tech-paper.png" alt="PVC & Paper Quality" />
                            </div>
                            <h4>PVC & Paper Quality</h4>
                            <p>All the paper used at Stenna is of the highest quality, ensuring powerful results and long-lasting durability for Every home.</p>
                        </div>
                    </div>
                </section>

                {/* 06. ARCHIVE SECTION */}
                <section className="archive-section">
                    <div className="archive-header">
                        <span className="section-label" style={{ justifyContent: 'center' }}>ARCHIVE</span>
                        <h2>Our Current Collections</h2>
                    </div>
                    {loading ? (
                        <div style={{ padding: '5rem', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', color: '#000', fontWeight: '800' }}>
                            Loading Collections...
                        </div>
                    ) : (
                        <div className="everything-grid-v2">
                            {groups.map((group) => (
                                <Link
                                    to={`/catalog?group=${group.id}`}
                                    key={group.id}
                                    className="everything-card"
                                    style={{ textDecoration: 'none', color: 'inherit', padding: '0', overflow: 'hidden', border: 'none' }}
                                >
                                    <div style={{ height: '500px', overflow: 'hidden', background: '#f5f5f5' }}>
                                        <img
                                            src={collectionImages[group.name] || group.image_url || fallbackImages[groups.indexOf(group) % fallbackImages.length]}
                                            alt={group.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                    <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.2rem', textTransform: 'uppercase' }}>{group.name}</h3>
                                        <div style={{ width: '40px', height: '1px', background: '#eee', margin: '1.5rem auto' }}></div>
                                        <p style={{ fontSize: '0.65rem', opacity: '0.5', letterSpacing: '0.1rem' }}>DISCOVER ARCHIVE</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <Footer style={{ marginTop: '0', borderTop: '1px solid #f0f0f0' }} />
            </div>
        </div>
    );
};

export default Home;
