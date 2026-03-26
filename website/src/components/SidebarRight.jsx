import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Layout, Sparkles, User } from 'lucide-react';

const SidebarRight = ({
    searchQuery = '',
    onSearchChange = () => { },
    showSearch = true,
    user = null,
    children
}) => {
    return (
        <div className="col-tools-panel desktop-only">
            {/* Search Section */}
            {showSearch && (
                <div className="tool-section">
                    <div className="search-input-wrapper-sidebar" style={{ position: 'relative', marginBottom: '2rem' }}>
                        <input
                            type="text"
                            placeholder="SEARCH"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    window.location.href = `/catalog?search=${searchQuery}`;
                                }
                            }}
                            style={{
                                width: '100%',
                                border: 'none',
                                borderBottom: '1px solid #000',
                                padding: '0.5rem 0',
                                fontSize: '0.75rem',
                                letterSpacing: '0.1em',
                                outline: 'none',
                                background: 'transparent',
                                textTransform: 'uppercase'
                            }}
                        />
                        <Search size={14} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    </div>
                </div>
            )}

            {/* Page Specific Actions (Passed as children) */}
            {children && (
                <div className="tool-section page-specific-actions">
                    {children}
                </div>
            )}

            {/* Discovery Section */}
            <div className="tool-section">
                <h3>DISCOVERY</h3>
                <Link to="/try-it-on" className="tool-link">
                    <Layout size={16} /> TRY IT ON YOUR WALL
                </Link>
                <Link to="/ai-recommendations" className="tool-link">
                    <Sparkles size={16} /> AI RECOMMENDATIONS
                </Link>
                <Link to="/catalog" className="tool-link">
                    <Layout size={16} /> BROWSE CATALOG
                </Link>
            </div>

            {/* User Account Section */}
            <div className="tool-section">
                <h3>ACCOUNT</h3>
                <div className="user-display">
                    <User size={16} />
                    <span className="user-name-label">
                        {user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : "GUEST"}
                    </span>
                </div>
                {user && (
                    <Link to="/profile" className="tool-link" style={{ marginTop: '1rem', fontSize: '0.65rem' }}>
                        VIEW PROFILE
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SidebarRight;
