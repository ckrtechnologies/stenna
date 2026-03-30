import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';
import '../styles/CatalogLayout.css';

const ReturnPolicy = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Return Policy | Stenna';
    }, []);

    return (
        <div className="catalog-page fade-in-up" style={{ paddingTop: 0 }}>
            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'RETURN POLICY' }]}
                    showFilters={false}
                />

                <div className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div className="static-page fade-in-up" style={{ padding: '2rem 5%' }}>
                        <header className="static-page-header">
                            <h3>Return Policy</h3>
                        </header>

                        <section className="static-content-section" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                            <p className="static-text">
                                We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
                            </p>

                            <h4>Eligibility</h4>
                            <p className="static-text">
                                To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
                            </p>

                            <h4>Starting a Return</h4>
                            <p className="static-text">
                                To start a return, you can contact us at digital@stenna.in. Please note that returns will need to be sent to our headquarters address.
                            </p>

                            <h4>Damages and issues</h4>
                            <p className="static-text">
                                Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
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

export default ReturnPolicy;
