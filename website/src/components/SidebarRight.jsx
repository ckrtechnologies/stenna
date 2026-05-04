import React from 'react';
import { Link } from 'react-router-dom';
import { Search, LayoutGrid, Sparkles, CircleDot } from 'lucide-react';

const SidebarRight = ({
    searchQuery = '',
    onSearchChange = () => { },
    showSearch = true,
    user = null,
    children
}) => {
    return (
        <div className="col-tools-panel desktop-only">
            {/* Search */}
            {showSearch && (
                <div className="tool-section">
                    <div style={{ position: 'relative' }}>
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
                                borderBottom: '1px solid #ccc',
                                padding: '0.4rem 20px 0.4rem 0',
                                fontSize: '0.65rem',
                                letterSpacing: '0.08em',
                                outline: 'none',
                                background: 'transparent',
                                textTransform: 'uppercase',
                                textAlign: 'right',
                                color: '#888',
                                fontWeight: 400,
                            }}
                        />
                        <Search size={12} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    </div>
                </div>
            )}

            {/* Page Specific Actions */}
            {children && (
                <div className="tool-section page-specific-actions">
                    {children}
                </div>
            )}

            {/* Discovery */}
            <div className="tool-section">
                <h3>DISCOVERY</h3>
                <Link to="/try-it-on" className="tool-link">
                    TRY IT ON YOUR WALL <LayoutGrid size={12} strokeWidth={1.5} opacity={0.6} />
                </Link>
                <Link to="/ai-recommendations" className="tool-link">
                    AI RECOMMENDATIONS <Sparkles size={12} strokeWidth={1.5} opacity={0.6} />
                </Link>
                <Link to="/catalog" className="tool-link">
                    BROWSE CATALOG <LayoutGrid size={12} strokeWidth={1.5} opacity={0.6} />
                </Link>
            </div>

            {/* Account */}
            <div className="tool-section">
                <h3>ACCOUNT</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : 'GUEST'}
                    </span>
                    <CircleDot size={12} strokeWidth={1.5} opacity={0.6} />
                </div>
                {user && (
                    <Link to="/profile" className="tool-link">
                        VIEW PROFILE
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SidebarRight;
