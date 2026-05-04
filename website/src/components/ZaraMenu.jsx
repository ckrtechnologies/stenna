import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGroups, fetchCategories } from '../services/api';
import '../styles/App.css';

const ZaraMenu = ({ isOpen, onClose, user, signOut }) => {
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [groupsData, categoriesData] = await Promise.all([
                    fetchGroups(),
                    fetchCategories()
                ]);
                setGroups(groupsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error loading menu data:', error);
            }
        };
        if (isOpen) loadData();
    }, [isOpen]);

    const getStyles = () => {
        const styleGroup = groups.find(g => g.slug === 'style');
        return styleGroup ? categories.filter(cat => cat.group_id === styleGroup.id) : [];
    };

    const getRooms = () => {
        const roomGroup = groups.find(g => g.slug === 'room');
        return roomGroup ? categories.filter(cat => cat.group_id === roomGroup.id) : [];
    };

    const styles = getStyles();
    const rooms = getRooms();


    return (
        <>
            {/*
              X button — position: fixed.
              Desktop: top: 1.25rem, left: 1% (matches sidebar hamburger)
              Mobile: top: 9px, left: 0.75rem (matches mobile header hamburger)
              Controlled via CSS media query in App.css
            */}
            <button
                className="zara-fixed-close-btn"
                onClick={onClose}
                aria-label="Close menu"
                style={{
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
            >
                <div className="zara-close-icon">
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </button>

            {/* Sliding overlay panel */}
            <div
                className={`zara-menu-overlay ${isOpen ? 'open' : ''}`}
                onClick={(e) => {
                    if (e.target.classList.contains('zara-menu-overlay')) onClose();
                }}
            >
                <div className="zara-menu-container">

                    {/* Desktop Header: logo centered */}
                    <header className="zara-menu-header desktop-only">
                        <Link to="/" className="zara-menu-logo" onClick={onClose}>
                            <img src="/logo.png" alt="STENNA" />
                        </Link>
                    </header>

                    {/* Mobile Header: logo centered */}
                    <header className="zara-menu-header mobile-only">
                        <Link to="/" className="zara-menu-logo" onClick={onClose}>
                            <img src="/logo.png" alt="STENNA" />
                        </Link>
                    </header>

                    {/* Content */}
                    <div className="zara-menu-content">

                        {/* Column 1: Collections (Groups) */}
                        <div className="zara-menu-column groups-col">
                            <span className="zara-menu-col-label">STYLE</span>
                            <ul className="zara-group-list">
                                {styles.map(cat => (
                                    <li key={cat.id}>
                                        <Link
                                            to={`/catalog?category=${cat.id}`}
                                            className="zara-group-link"
                                            onClick={onClose}
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2: Exclusives + By Room */}
                        <div className="zara-menu-column categories-col">
                            {/* Exclusives Section - Moved to top for visibility */}
                            <div className="exclusives-section">
                                <span className="zara-menu-col-label">COLLECTIONS</span>
                                <Link to="/catalog?group=new" className="zara-exclusive-link" onClick={onClose}>
                                    <div className="zara-exclusive-content">
                                        <span>NEW ARRIVALS</span>
                                        <span className="zara-badge-new">NEW</span>
                                    </div>
                                </Link>
                                <Link to="/catalog?group=limited-stock" className="zara-exclusive-link" onClick={onClose}>
                                    <div className="zara-exclusive-content">
                                        <span>LIMITED STOCK</span>
                                        <span className="zara-badge-limited">HOT</span>
                                    </div>
                                </Link>
                            </div>

                            <span className="zara-menu-col-label">BY ROOM</span>
                            <ul className="zara-category-list">
                                {rooms.map(cat => (
                                    <li key={cat.id}>
                                        <Link
                                            to={`/catalog?category=${cat.id}`}
                                            className="zara-cat-link"
                                            onClick={onClose}
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Discover + Account */}
                        <div className="zara-menu-column editorial-col">
                            <span className="zara-menu-col-label">DISCOVER</span>
                            <ul className="zara-category-list">
                                <li><Link to="/try-it-on" className="zara-cat-link" onClick={onClose}>TRY IT ON (AI)</Link></li>
                                <li><Link to="/ai-recommendations" className="zara-cat-link" onClick={onClose}>AI RECOMMENDATIONS</Link></li>
                                <li><Link to="/installation-guide" className="zara-cat-link" onClick={onClose}>INSTALLATION GUIDE</Link></li>
                                <li><Link to="/about" className="zara-cat-link" onClick={onClose}>ABOUT STENNA</Link></li>
                                <li><Link to="/contact" className="zara-cat-link" onClick={onClose}>CONTACT US</Link></li>
                            </ul>

                            <div className="zara-menu-footer-links">
                                {user ? (
                                    <>
                                        <Link to="/profile" className="zara-cat-link" onClick={onClose}>VIEW PROFILE</Link>
                                        <button
                                            onClick={() => { signOut(); onClose(); }}
                                            className="zara-cat-link"
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                                        >
                                            LOG OUT
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="zara-cat-link" onClick={onClose}>LOG IN</Link>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ZaraMenu;
