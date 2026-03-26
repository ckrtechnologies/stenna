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
                <div className="zara-menu-header">
                    <button className="zara-close-btn" onClick={onClose} aria-label="Close menu">
                        <div className="zara-close-icon">
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                    </button>
                    <div className="zara-logo-large-container">
                        <img src="/logo.png" alt="STENNA" className="zara-logo-img-large" />
                    </div>
                </div>

                <div className="zara-menu-content">
                    {/* Column 1: Groups */}
                    <div className={`zara-menu-column groups-col ${(isMobile && viewMode !== 'groups') ? 'mobile-hidden' : ''}`}>
                        {isMobile && viewMode === 'categories' && (
                            <button className="zara-menu-back-btn" onClick={() => setViewMode('groups')}>
                                ← BACK
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
                            <button className="zara-menu-back-btn" onClick={() => setViewMode('groups')}>
                                ← BACK TO MAIN
                            </button>
                        )}
                        <div className="categories-grid">
                            <div className="category-section">
                                <span className="section-label">[01] COLLECTION</span>
                                <ul className="zara-category-list">
                                    {categories
                                        .filter(cat => cat.group_id === activeGroup)
                                        .map(cat => (
                                            <li key={cat.id}>
                                                <Link to={`/catalog?group=${activeGroup}&category=${cat.id}`} onClick={onClose}>
                                                    {cat.name}
                                                </Link>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                            <div className="category-section" style={{ marginTop: '3rem' }}>
                                <span className="section-label">[02] STENNA TOOLS</span>
                                <ul className="zara-category-list">
                                    <li>
                                        <Link to="/try-it-on" onClick={onClose}>TRY IT ON YOUR WALL</Link>
                                    </li>
                                    <li>
                                        <Link to="/ai-recommendations" onClick={onClose}>AI RECOMMENDATIONS</Link>
                                    </li>
                                    <li>
                                        <Link to="/profile/enquiries" onClick={onClose}>ENQUIRIES</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Editorial / Image */}
                    <div className={`zara-menu-column editorial-col ${(isMobile && viewMode !== 'groups') ? 'mobile-hidden' : ''}`}>
                        <div className="editorial-image-container">
                            <img
                                src="https://images.unsplash.com/photo-1600607687920-4e5252c35a93?auto=format&fit=crop&q=80"
                                alt="Stenna Editorial"
                            />
                            <div className="editorial-label">STENNA HERITAGE</div>
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
