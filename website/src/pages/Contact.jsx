import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import '../styles/StaticPages.css';
import '../styles/CatalogLayout.css';

const Contact = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Contact Us | Stenna';
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        comment: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        alert("Thank you! Your message has been sent.");
    };

    return (
        <div className="catalog-page contact-page-standard fade-in-up" style={{ paddingTop: 0 }}>
            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'CONTACT US' }]}
                    showFilters={false}
                />

                <div className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div className="static-page fade-in-up" style={{ padding: '2rem 5%' }}>
                        <nav className="breadcrumb-nav" style={{ marginBottom: '2rem', fontSize: '0.75rem', color: '#888' }}>
                            <Link to="/" style={{ textTransform: 'none', letterSpacing: '0', color: '#888' }}>Home</Link> &rsaquo; <span style={{ color: '#888' }}>Contact Us</span>
                        </nav>
                        <header className="static-page-header contact-header">
                            <h3 style={{ textTransform: 'none', fontWeight: 700 }}>Stay In Touch!</h3>
                            <div className="header-line"></div>
                        </header>

                        <div className="contact-layout-grid">
                            {/* --- LEFT COLUMN: INTRO + FORM --- */}
                            <div className="contact-form-column">
                                <div className="contact-intro-text">
                                    <p className="static-text">
                                        Fill in your details and leave a message, our team will get in touch with you within 24 to 48 hours.
                                    </p>
                                    <p className="static-text">
                                        For booking your Installation appointment, you can fill in your preferred date and time for installation and you would receive a call from our experts for confirmation of the appointment.
                                    </p>
                                </div>

                                <form className="minimal-contact-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            name="name" 
                                            placeholder="Name" 
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            placeholder="Phone Number" 
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input 
                                            type="email" 
                                            name="email" 
                                            placeholder="Email" 
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <textarea 
                                            name="comment" 
                                            placeholder="Please leave your comment here" 
                                            rows="6"
                                            value={formData.comment}
                                            onChange={handleInputChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn-submit-contact">
                                        SUBMIT CONTACT
                                    </button>
                                </form>
                            </div>

                            {/* --- RIGHT COLUMN: LOCATIONS --- */}
                            <div className="contact-locations-column">
                                {/* 01. HEADQUARTER */}
                                <div className="location-item-block">
                                    <div className="location-number">01</div>
                                    <h3 className="location-label">HEADQUARTER</h3>
                                    <div className="location-details">
                                        <p className="loc-name">STENNA WALLPAPERS PVT. LTD.</p>
                                        <p>OPP GHTORNI METRO PILLAR NO 138</p>
                                        <p>MCD GIRLS SCHOOL LANE, IN FRONT</p>
                                        <p>OF SAI RAM PAPER, NEAR MARUTI</p>
                                        <p>CHOWNK, GHITORNI, NEW DELHI,</p>
                                        <p>110030</p>
                                        
                                        <p className="loc-contact-meta">
                                            <strong>Email:</strong> info@stenna.in<br/>
                                            <strong>Call Us:</strong> +91-99715 75710
                                        </p>
                                    </div>
                                </div>

                                {/* 02. GALLERY */}
                                <div className="location-item-block">
                                    <div className="location-number">02</div>
                                    <h3 className="location-label">GALLERY</h3>
                                    <div className="location-details">
                                        <p className="loc-name">STENNA WALLPAPERS PVT. LTD.</p>
                                        <p>SHOP NO 1, 4855-56 HARBANS SINGH</p>
                                        <p>STREET, ANSARI ROAD NO. 24,</p>
                                        <p>DARYAGANJ, DELHI, 110006</p>
                                    </div>
                                </div>
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

export default Contact;
