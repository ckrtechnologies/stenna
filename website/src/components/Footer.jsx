import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import '../styles/Footer.css';

const Footer = ({ style }) => {
    return (
        <footer id="site-footer" className="footer" style={style}>
            <div className="footer-container">
                {/* Column 1: Company Info */}
                <div className="footer-section">
                    <h3>Stenna Wallpapers Pvt. Ltd.</h3>
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
                    <h3>Further Info</h3>
                    <ul className="footer-links-list">
                        <li><Link to="/about">About us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faqs">FAQs</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link to="/refund-policy">Refund Policy</Link></li>
                        <li><Link to="/return-policy">Return Policy</Link></li>
                    </ul>
                </div>

                {/* Column 3: Shop */}
                <div className="footer-section">
                    <h3>Shop</h3>
                    <ul className="footer-links-list">
                        <li><Link to="/catalog">Catalog</Link></li>
                        <li><Link to="/try-it-on">Try it on your wall (AI)</Link></li>
                        <li><Link to="/ai-recommendations">AI Recommendations</Link></li>
                    </ul>
                </div>

                {/* Column 4: Newsletter & Social */}
                <div className="footer-section">
                    <div className="social-section">
                        <h3>Follow Us</h3>
                        <div className="footer-social-icons">
                            <a href="https://facebook.com/stenna" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
                            <a href="https://instagram.com/stenna" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                            <a href="https://youtube.com/stenna" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
                        </div>
                    </div>

                    <div className="newsletter-section">
                        <h3>Subscribe to our newsletters</h3>
                        <p className="newsletter-subtitle">Stay Updated on all new arrivals and discounts!</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="newsletter-input-group">
                                <input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="newsletter-input"
                                    required
                                />
                                <button type="submit" className="newsletter-submit">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            
        </footer>
    );
};

export default Footer;
