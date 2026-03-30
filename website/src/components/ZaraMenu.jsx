import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGroups, fetchCategories } from '../services/api';
import '../styles/App.css';

const ZaraMenu = ({ isOpen, onClose, user, signOut }) => {
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [viewMode, setViewMode] = useState('groups'); // 'groups' or 'categories' for mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getInitials = (user) => {
        const name = user?.user_metadata?.full_name || user?.email || 'U';
        return name.charAt(0).toUpperCase();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const groupsData = await fetchGroups();
                const categoriesData = await fetchCategories();
                setGroups(groupsData);
                setCategories(categoriesData);
                if (groupsData.length > 0) setActiveGroup(groupsData[0].id);
            } catch (error) {
                console.error('Error loading menu data:', error);
            }
        };
        if (isOpen) loadData();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={`zara-menu-overlay ${isOpen ? 'open' : ''}`}
            onClick={(e) => {
                if (e.target.classList.contains('zara-menu-overlay')) {
                    onClose();
                }
            }}
        >
            <div className="zara-menu-container">
                <header className="zara-menu-header">
                    {/* Desktop View: Exact replica of SidebarLeft branding stack */}
                    <div className="sidebar-brand-container desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '0' }}>
                        <div className="menu-trigger-sidebar">
                            <button className="zara-close-btn" onClick={onClose} aria-label="Close menu">
                                <div className="zara-close-icon">
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                </div>
                            </button>
                        </div>
                        <Link to="/" className="sidebar-logo">
                            <img src="/logo.png" alt="STENNA" style={{ width: '100%', maxWidth: '180px', height: 'auto' }} />
                        </Link>
                    </div>

                    {/* Mobile/Tablet View: Exact replica of MobileHeader fixed-container structure */}
                    <div className="mobile-header mobile-only" style={{ position: 'relative', background: 'transparent', borderBottom: 'none', height: 'var(--mobile-header-h)', width: '100%' }}>
                        <div className="mobile-header-inner">
                            <div className="mobile-header-left">
                                <button className="mobile-header-menu-btn" onClick={onClose} aria-label="Close menu">
                                    <div className="zara-close-icon">
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                    </div>
                                </button>
                            </div>
                            <div className="mobile-header-logo">
                                <Link to="/">
                                    <img src="/logo.png" alt="STENNA" className="mobile-logo-img" />
                                </Link>
                            </div>
                            <div className="mobile-header-right"></div>
                        </div>
                    </div>
                </header>

                <div className="zara-menu-content">
                    {/* Column 1: Groups */}
                    <div className={`zara-menu-column groups-col ${(isMobile && viewMode !== 'groups') ? 'mobile-hidden' : ''}`}>
                        {isMobile && viewMode === 'categories' && (
                            <button className="zara-menu-back-btn text-nav" onClick={() => setViewMode('groups')}>
                                ← Back
                            </button>
                        )}
                        <ul className="zara-group-list">
                            {groups.map(group => (
                                <li
                                    key={group.id}
                                    className={activeGroup === group.id ? 'active' : ''}
                                    onMouseEnter={() => !isMobile && setActiveGroup(group.id)}
                                    onClick={() => {
                                        if (isMobile) {
                                            setActiveGroup(group.id);
                                            setViewMode('categories');
                                        }
                                    }}
                                >
                                    <Link
                                        to={isMobile ? '#' : `/catalog?group=${group.id}`}
                                        className="text-nav"
                                        onClick={(e) => {
                                            if (isMobile) e.preventDefault();
                                            else onClose();
                                        }}
                                    >
                                        {group.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Categories for Active Group */}
                    <div className={`zara-menu-column categories-col ${(isMobile && viewMode !== 'categories') ? 'mobile-hidden' : ''}`}>
                        {isMobile && (
                            <button className="zara-menu-back-btn text-nav" onClick={() => setViewMode('groups')}>
                                ← Back to Main
                            </button>
                        )}
                        <div className="categories-grid">
                            <div className="category-section">
                                <span className="section-label"> </span>
                                <ul className="zara-category-list">
                                    {categories
                                        .filter(cat => cat.group_id === activeGroup)
                                        .map(cat => (
                                            <li key={cat.id}>
                                                <Link 
                                                    to={`/catalog?group=${activeGroup}&category=${cat.id}`} 
                                                    className="text-nav"
                                                    onClick={onClose}
                                                >
                                                    {cat.name}
                                                </Link>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                            <div className="category-section" style={{ marginTop: '3rem' }}>
                                <span className="section-label"></span>
                                <ul className="zara-category-list">
                                    <li>
                                        <Link 
                                            to="/try-it-on" 
                                            className="text-nav"
                                            onClick={onClose}
                                        >
                                            Try it on your wall
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/ai-recommendations" 
                                            className="text-nav"
                                            onClick={onClose}
                                        >
                                            AI Recommendations
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/profile/enquiries" 
                                            className="text-nav"
                                            onClick={onClose}
                                        >
                                            Enquiries
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Editorial / Image / Support */}
                    <div className={`zara-menu-column editorial-col ${(isMobile && viewMode !== 'groups') ? 'mobile-hidden' : ''}`}>
                        <div className="category-section" style={{ marginBottom: 'auto' }}>
                            <span className="section-label"></span>
                            <ul className="zara-category-list">
                                <li><Link to="/about" onClick={onClose}>ABOUT US</Link></li>
                                <li><Link to="/contact" onClick={onClose}>CONTACT US</Link></li>
                                <li><Link to="/faqs" onClick={onClose}>FAQS</Link></li>
                                <li><Link to="/privacy-policy" onClick={onClose}>PRIVACY POLICY</Link></li>
                                <li><Link to="/refund-policy" onClick={onClose}>REFUND POLICY</Link></li>
                                <li><Link to="/return-policy" onClick={onClose}>RETURN POLICY</Link></li>
                            </ul>
                        </div>
                        <div className="zara-menu-footer-links">
                            {user ? (
                                <div className="zara-user-section">
                                    <div className="user-profile-header">
                                        <div className="avatar initials">{getInitials(user)}</div>
                                        <div className="user-details">
                                            <span className="user-name">{user.user_metadata?.full_name || 'Stenna User'}</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <Link to="/profile" className="profile-link" onClick={onClose}>VIEW PROFILE</Link>
                                                <Link to="/profile/enquiries" className="profile-link" onClick={onClose} style={{ fontSize: '0.65rem' }}>MY ENQUIRIES</Link>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { signOut(); onClose(); }}
                                        className="zara-logout-btn"
                                    >
                                        LOG OUT
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" onClick={onClose}>LOG IN</Link>
                            )}
                            <Link to="/help" onClick={onClose}>HELP</Link>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default ZaraMenu;
