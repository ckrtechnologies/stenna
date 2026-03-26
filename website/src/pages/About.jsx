import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';

const About = () => {
    return (
        <div className="static-page fade-in-up">
            {/* Global Menu Trigger */}
            <div 
                className="menu-trigger-global" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-mega-menu'))}
                style={{ 
                    position: 'fixed', 
                    top: '30px', 
                    left: '30px', 
                    zIndex: 1000, 
                    cursor: 'pointer',
                    padding: '10px'
                }}
            >
                <div className="zara-hamburger">
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </div>

            <header className="static-page-header">
                <div className="static-breadcrumb">
                    <Link to="/">HOME</Link> / <span>ABOUT US</span>
                </div>
                <h1>ABOUT STENNA</h1>
            </header>

            <section className="static-content-section">
                <h2>Our Mission</h2>
                <p className="static-text">
                    Who you are, what you believe in: that's what your walls should reflect. And that's what we make Wall Paper for. 
                    Welcome to innovative wallpapers and let your wall reflect your style.
                </p>
                <p className="static-text">
                    Stenna wallpapers come from our Indian values of simplicity, quality, and longevity. 
                    Designed to be of the time and for the time, they are crafted with such modern elegance 
                    that they become the building blocks of your home interior's style.
                </p>
            </section>

            <section className="static-content-section">
                <h2>Designed for You</h2>
                <p className="static-text">
                    The simplest design hiding the most thoughtful and modern details. The best in market and 
                    curated especially for Indian walls; made to be affordable and accessible to every homeowner.
                </p>
                <p className="static-text">
                    We are constantly innovating, bringing more warmth, more lightness, better designs, and 
                    better comfort to your life. It never stops evolving because your life never stops changing.
                </p>
                <p className="static-text">
                    Simple wallpaper with a not-so-simple purpose: to make your home look better.
                </p>
            </section>

            <section className="static-content-section">
                <h2>Our Presence</h2>
                <p className="static-text">
                    Based in Delhi, Stenna Wallpapers Pvt. Ltd. has been at the forefront of interior decoration 
                    solutions, combining traditional aesthetics with modern manufacturing techniques to deliver 
                    premium wall coverings across India.
                </p>
            </section>
            <Footer style={{ marginTop: '0', backgroundColor: '#000' }} />
        </div>
    );
};

export default About;
