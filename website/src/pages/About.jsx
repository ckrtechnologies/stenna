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
                    <div className="static-page fade-in-up">
                        <nav className="breadcrumb-nav">
                            <Link to="/">Home</Link> &rsaquo; <span>This Is Stenna</span>
                        </nav>

                        <header className="about-header">
                            <h3>This Is Stenna</h3>
                        </header>

                        <div className="about-layout-grid">
                            <div className="about-story-column">
                                <p className="static-text">
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
                                <p className="static-text last-para">
                                    Simple wall paper with a not-so-simple purpose: to make your home look better.
                                </p>
                            </div>

                            <div className="about-image-column">
                                <img 
                                    src="/hero/pure_minimal.png" 
                                    alt="This Is Stenna Lifestyle" 
                                    className="about-lifestyle-image"
                                />
                            </div>
                        </div>
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
