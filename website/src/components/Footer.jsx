import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Youtube } from 'lucide-react';
import '../styles/Footer.css';

const Footer = ({ style }) => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        // TODO: connect to newsletter API
        setEmail('');
    };

    return (
        <footer id="site-footer" className="footer" style={style}>
            {/* Main grid */}
            <div className="footer-container">

                {/* Column 1: Logo + Company Info */}
                <div className="footer-section footer-brand">
                    <Link to="/" className="footer-logo-link">
                        <img src="/logo.png" alt="STENNA" className="footer-logo-img" />
                    </Link>
                    <p>Stenna Wallpapers Pvt. Ltd.</p>
                    <p>Opp Ghitorni Metro Pillar No 138</p>
                    <p>MCD Girls School Lane, in front of Sai Ram Papers,</p>
                    <p>near Maruti Chowk, Ghitorni, Delhi 110030</p>
                    <div className="footer-contact-info">
                        <p>Call us at: +91 7065320009</p>
                        <p>Email: digital@stenna.in</p>
                    </div>
                </div>

                {/* Column 2: Further Info */}
                <div className="footer-section">
                    <h3>FURTHER INFO</h3>
                    <ul className="footer-links-list">
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faqs">FAQs</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link to="/refund-policy">Refund Policy</Link></li>
                        <li><Link to="/return-policy">Return Policy</Link></li>
                    </ul>
                </div>

                {/* Column 3: Shop */}
                <div className="footer-section">
                    <h3>SHOP</h3>
                    <ul className="footer-links-list">
                        <li><Link to="/catalog">Catalog</Link></li>
                        <li><Link to="/try-it-on">Try It On Your Wall (AI)</Link></li>
                        <li><Link to="/ai-recommendations">AI Recommendations</Link></li>
                    </ul>
                </div>

                {/* Column 4: Follow + Newsletter */}
                <div className="footer-section">
                    <div className="social-section">
                        <h3>FOLLOW US</h3>
                        <div className="footer-social-icons">
                            <a href="https://facebook.com/stenna" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <Facebook size={16} strokeWidth={1.5} />
                            </a>
                            <a href="https://linkedin.com/company/stenna" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin size={16} strokeWidth={1.5} />
                            </a>
                            <a href="https://youtube.com/stenna" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                <Youtube size={16} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    <div className="newsletter-section">
                        <h3>SUBSCRIBE TO OUR NEWSLETTERS</h3>
                        <p className="newsletter-subtitle">Stay Updated on all new arrivals and discounts!</p>
                        <form className="newsletter-form" onSubmit={handleSubscribe}>
                            <div className="newsletter-input-group">
                                <input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="newsletter-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="newsletter-submit">SUBMIT</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom bar: copyright left, tagline right */}
            <div className="footer-bottom">
                <span className="copyright">© 2026 Stenna Wallpapers Pvt. Ltd. All rights reserved.</span>
                <span className="footer-tagline">Made with care in India</span>
            </div>
        </footer>
    );
};

export default Footer;
