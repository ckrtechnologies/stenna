import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';
import '../styles/CatalogLayout.css';

const About = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'About Us | Stenna';
    }, []);

    return (
        <div className="catalog-page fade-in-up" style={{ paddingTop: 0 }}>
            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'ABOUT US' }]}
                    showFilters={false}
                />

                <div className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div className="static-page fade-in-up" style={{ padding: '2rem 5%' }}>
                        <header className="static-page-header">
                            <h3>About Stenna</h3>
                        </header>

                        <div className="about-hero-image" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4rem auto' }}>
                            <img 
                                src="/hero/pure_minimal.png" 
                                alt="Premium Stenna Wallpaper" 
                                style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'cover', display: 'block' }}
                            />
                        </div>

                        <section className="static-content-section" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                            <p className="static-text" style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Who you are, what you believe in: that's what your walls should reflect. And that's what we make Wall Paper for. Welcome to innovative wallpapers and let your wall reflect your style.
                            </p>
                            <p className="static-text">
                                Wall paper that comes from our Indian values of simplicity, quality and longevity. Designed to be of the time and for the time. Made with such modern elegance that it becomes the building block of your home interior's style.
                            </p>
                            <p className="static-text">
                                A perfect wall that always be perfected with stylish wall papers.
                            </p>
                            <p className="static-text">
                                The simplest design hiding the most thoughtful and modern details. The best in market and curated especially for Indian walls; made to be affordable and accessible to every homeowner.
                            </p>
                            <p className="static-text">
                                Wall papers that we are constantly innovating, bringing more warmth, more lightness, better designs and better comfort to your life.
                            </p>
                            <p className="static-text">
                                It never stops evolving because your life never stops changing.
                            </p>
                            <p className="static-text" style={{ fontWeight: '500', marginTop: '2rem' }}>
                                Simple wall paper with a not-so-simple purpose: to make your home look better.
                            </p>
                        </section>

                        <section className="static-content-section hq-section">
                            <h3 className="section-label-hq">Headquarters</h3>
                            <div className="hq-layout">
                                <div className="hq-info">
                                    <p className="static-text hq-name">
                                        Stenna Wallpapers Pvt. Ltd.
                                    </p>
                                    <p className="static-text hq-address">
                                        Opp Ghitorni Metro Pillar No 138 MCD Girls School Lane,<br/>
                                        in front of Sai Ram Papers, near Maruti Chowk,<br/>
                                        Ghitorni, Delhi 110030
                                    </p>
                                    <p className="static-text hq-contact">
                                        <strong>Call us at:</strong> <a href="tel:+917065320009">+91 7065320009</a><br/>
                                        <strong>Email:</strong> <a href="mailto:digital@stenna.in">digital@stenna.in</a>
                                    </p>
                                </div>
                                <div className="hq-map">
                                    <iframe 
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5264387600854!2d77.1293399!3d28.5231019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1fba55555555%3A0x6d9f3f9f9f9f9f9f!2sStenna%20Wallpapers%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1711810000000!5m2!1sen!2sin" 
                                        width="100%" 
                                        height="300" 
                                        style={{ border: 0 }} 
                                        allowFullScreen="" 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Stenna Headquarters Map"
                                    ></iframe>
                                </div>
                            </div>
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

export default About;
