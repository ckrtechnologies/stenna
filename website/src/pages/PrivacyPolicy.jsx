import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';
import '../styles/CatalogLayout.css';

const PrivacyPolicy = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Privacy Policy | Stenna';
    }, []);

    return (
        <div className="catalog-page privacy-policy-page fade-in-up" style={{ paddingTop: 0 }}>
            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'PRIVACY POLICY' }]}
                    showFilters={false}
                />

                <div className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div className="static-page fade-in-up">
                        <header className="static-page-header">
                            <h3>Privacy Policy</h3>
                        </header>

                        <section className="static-content-section">
                            <p className="static-text">
                                This Privacy Policy describes how stenna.in (the “Site” or “we”) collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.
                            </p>

                            <h4>Contact</h4>
                            <p className="static-text">
                                After reviewing this policy, if you have additional questions, want more information about our privacy practices, or would like to make a complaint, please contact us by e-mail at digital@stenna.in or by mail using the details provided below:
                            </p>
                            <p className="static-text">
                                Stenna Wallpapers Pvt. Ltd., Opp Ghitorni Metro Pillar 138 , MCD Girls School Lane in front of Sai Ram Papers, near Maruti Chowk, Ghitorni, 110030 New Delhi DL, India
                            </p>

                            <p className="static-text">
                                When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information about an identifiable individual (including the information below) as “Personal Information”. See the list below for more information about what Personal Information we collect and why.
                            </p>

                            <h3>Device Information</h3>
                            <ul className="static-text" style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Purpose of collection:</strong> to load the Site accurately for you, and to perform analytics on Site usage to optimize our Site.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Source of collection:</strong> Collected automatically when you access our Site using cookies, log files, web beacons, tags, or pixels.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Disclosure for a business purpose:</strong> shared with our processor Shopify.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Personal Information collected:</strong> version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
                            </ul>

                            <h3>Order Information</h3>
                            <ul className="static-text" style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Purpose of collection:</strong> to provide products or services to you to fulfill our contract, to process your payment information, arrange for shipping, and provide you with invoices and/or order confirmations, communicate with you, screen our orders for potential risk or fraud, and when in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Source of collection:</strong> collected from you.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Disclosure for a business purpose:</strong> shared with our processor Shopify.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Personal Information collected:</strong> name, billing address, shipping address, payment information, email address, and phone number.</li>
                            </ul>

                            <h3>Customer Support Information</h3>
                            <ul className="static-text" style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Purpose of collection:</strong> to provide customer support.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Source of collection:</strong> collected from you.</li>
                            </ul>

                            <h2>Sharing Personal Information</h2>
                            <p className="static-text">
                                We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example:
                            </p>
                            <ul className="static-text" style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>We use Shopify to power our online store. You can read more about how Shopify uses your Personal Information here: <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>https://www.shopify.com/legal/privacy</a>.</li>
                                <li style={{ marginBottom: '0.5rem' }}>We may share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.</li>
                            </ul>

                            <h2>Behavioural Advertising</h2>
                            <p className="static-text">
                                As described above, we use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you. For example:
                            </p>
                            <ul className="static-text" style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>We use Google Analytics to help us understand how our customers use the Site. You can read more about how Google uses your Personal Information here: <a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>https://www.google.com/intl/en/policies/privacy/</a>. You can also opt-out of Google Analytics here: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>https://tools.google.com/dlpage/gaoptout</a>.</li>
                            </ul>
                            <p className="static-text">
                                For more information about how targeted advertising works, you can visit the Network Advertising Initiative’s (“NAI”) educational page at <a href="https://www.networkadvertising.org/understanding-online-advertising/how-does-it-work" target="_blank" rel="noreferrer" style={{ color: 'inherit', wordBreak: 'break-all' }}>https://www.networkadvertising.org/understanding-online-advertising/how-does-it-work</a>.
                            </p>
                            
                            <h2>Using Personal Information</h2>
                            <p className="static-text">
                                We use your personal Information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.
                            </p>

                            <h3>Retention</h3>
                            <p className="static-text">
                                When you place an order through the Site, we will retain your Personal Information for our records unless and until you ask us to erase this information. For more information on your right of erasure, please see the ‘Your rights’ section below.
                            </p>
                            
                            <h2>Cookies</h2>
                            <p className="static-text">
                                A cookie is a small amount of information that’s downloaded to your computer or device when you visit our Site. We use a number of different cookies, including functional, performance, advertising, and social media or content cookies. Cookies make your browsing experience better by allowing the website to remember your actions and preferences (such as login and region selection).
                            </p>
                            <p className="static-text">
                                The length of time that a cookie remains on your computer or mobile device depends on whether it is a “persistent” or “session” cookie. Session cookies last until you stop browsing and persistent cookies last until they expire or are deleted. Most of the cookies we use are persistent and will expire between 30 minutes and two years from the date they are downloaded to your device.
                            </p>
                            <p className="static-text">
                                You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can negatively impact your user experience and parts of our website may no longer be fully accessible.
                            </p>

                            <h3>Do Not Track</h3>
                            <p className="static-text">
                                Please note that because there is no consistent industry understanding of how to respond to “Do Not Track” signals, we do not alter our data collection and usage practices when we detect such a signal from your browser.
                            </p>

                            <h2>Changes</h2>
                            <p className="static-text">
                                We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
                            </p>
                            
                            <h2>Complaints</h2>
                            <p className="static-text">
                                As noted above, if you would like to make a complaint, please contact us by e-mail or by mail using the details provided under “Contact” above.
                            </p>
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

export default PrivacyPolicy;
