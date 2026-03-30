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
        <div className="col-tools-panel desktop-only" style={{ textAlign: 'right', alignItems: 'flex-end' }}>
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
                                textTransform: 'uppercase',
                                textAlign: 'right',
                                paddingRight: '20px'
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
            <div className="tool-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <h3 style={{ textAlign: 'right' }}>DISCOVERY</h3>
                <Link to="/try-it-on" className="tool-link" style={{ justifyContent: 'flex-end' }}>
                    TRY IT ON YOUR WALL <Layout size={16} />
                </Link>
                <Link to="/ai-recommendations" className="tool-link" style={{ justifyContent: 'flex-end' }}>
                    AI RECOMMENDATIONS <Sparkles size={16} />
                </Link>
                <Link to="/catalog" className="tool-link" style={{ justifyContent: 'flex-end' }}>
                    BROWSE CATALOG <Layout size={16} />
                </Link>
            </div>

            {/* User Account Section */}
            <div className="tool-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <h3 style={{ textAlign: 'right' }}>ACCOUNT</h3>
                <div className="user-display" style={{ justifyContent: 'flex-end' }}>
                    <span className="user-name-label">
                        {user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : "GUEST"}
                    </span>
                    <User size={16} />
                </div>
                {user && (
                    <Link to="/profile" className="tool-link" style={{ marginTop: '1rem', fontSize: '0.65rem', justifyContent: 'flex-end' }}>
                        VIEW PROFILE
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SidebarRight;
