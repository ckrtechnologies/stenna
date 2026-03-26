import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';

const Contact = () => {
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
                    <Link to="/">HOME</Link> / <span>CONTACT US</span>
                </div>
                <h1>GET IN TOUCH</h1>
            </header>

            <section className="static-content-section">
                <h2>Our Locations</h2>
                <p className="static-text">
                    Whether you are an architect, an interior designer, or a homeowner looking for the perfect 
                    wallpaper, we are here to assist you. Visit our locations or reach out to us directly.
                </p>

                <div className="static-grid">
                    <div className="contact-box">
                        <h3>01. HEADQUARTER</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <MapPin size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                            <div>
                                <p>STENNA WALLPAPERS PVT. LTD.</p>
                                <p>Opp Ghitorni Metro Pillar No 138</p>
                                <p>MCD Girls School Lane, Ghitorni</p>
                                <p>New Delhi, 110030</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <Phone size={18} />
                            <p>+91 7065320009</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Mail size={18} />
                            <p>digital@stenna.in</p>
                        </div>
                    </div>

                    <div className="contact-box">
                        <h3>02. GALLERY</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <MapPin size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                            <div>
                                <p>STENNA WALLPAPERS PVT. LTD.</p>
                                <p>Shop No 1, 4855-56 Harbans Singh St.</p>
                                <p>Ansari Road No. 24, Daryaganj</p>
                                <p>Delhi, 110006</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <Phone size={18} />
                            <p>+91 99715 75710</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Mail size={18} />
                            <p>info@stenna.in</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* <section className="static-content-section">
                <h2>Inquiry</h2>
                <p className="static-text">
                    For bulk orders, partnership inquiries, or general questions, please feel free 
                    to drop us an email or give us a call. Our team typically responds within 24 hours.
                </p>
            </section> */}
            {/* <Footer style={{ marginTop: '0', backgroundColor: '#000' }} /> */}
        </div>
    );
};

export default Contact;
