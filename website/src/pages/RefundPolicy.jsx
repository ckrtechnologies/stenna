import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';
import '../styles/CatalogLayout.css';

const RefundPolicy = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Refund Policy | Stenna';
    }, []);

    return (
        <div className="catalog-page refund-policy-page fade-in-up" style={{ paddingTop: 0 }}>
            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'REFUND POLICY' }]}
                    showFilters={false}
                />

                <div className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div className="static-page" style={{ padding: '4rem 5%' }}>
                        <header className="static-page-header">
                            <h3>Refund Policy</h3>
                        </header>

                        <section className="static-content-section">
                            <p className="static-text">
                                We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
                            </p>
                            <p className="static-text">
                                To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
                            </p>
                            <p className="static-text">
                                To start a return, you can contact us at <a href="mailto:digital@stenna.in" className="static-link">digital@stenna.in</a>. Please note that returns will need to be sent to the following address: Opp Ghitorni Metro Pillar No 138 MCD Girls School Lane, in front of Sai Ram Papers, near Maruti Chowk, Ghitorni, New Delhi, Delhi 110030
                            </p>
                            <p className="static-text">
                                If your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                            </p>
                            <p className="static-text">
                                You can always contact us for any return question at <a href="mailto:digital@stenna.in" className="static-link">digital@stenna.in</a>.
                            </p>

                            <h3>Cancellations</h3>
                            <p className="static-text">
                                Cancellation of an order can only be done before dispatch. After dispatch the Return process mentioned above will be followed.
                            </p>

                            <h3>Damages and issues</h3>
                            <p className="static-text">
                                Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
                            </p>

                            <h3>Exceptions / non-returnable items</h3>
                            <p className="static-text">
                                Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
                            </p>
                            <p className="static-text">
                                Unfortunately, we cannot accept returns on sale items or gift cards.
                            </p>

                            <h4>Exchanges</h4>
                            <p className="static-text">
                                The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                            </p>

                            <h4>Refunds</h4>
                            <p className="static-text">
                                We will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
                            </p>
                            <p className="static-text">
                                If more than 15 business days have passed since we've approved your return, please contact us at <a href="mailto:digital@stenna.in" className="static-link">digital@stenna.in</a>.
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

export default RefundPolicy;
