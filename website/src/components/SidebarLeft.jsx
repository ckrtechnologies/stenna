import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import GroupList from './GroupList';
import CategoryList from './CategoryList';

const SidebarLeft = ({
    breadcrumb = [],
    groups = [],
    selectedGroupIds = [],
    onToggleGroup = () => { },
    categories = [],
    selectedCategoryIds = [],
    onToggleCategory = () => { },
    onOpenFilters = () => { },
    count = null,
    loading = false,
    showFilters = false
}) => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="col-filter-trigger desktop-only" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 20px)', 
            gap: '1rem', 
            overflowY: 'auto',
            paddingRight: '10px',
            scrollbarWidth: 'none'
        }}>
            {/* Global Menu Trigger & Logo */}
            <div className="sidebar-brand-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div
                    className="menu-trigger-sidebar"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mega-menu'))}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="zara-hamburger">
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                </div>

                <Link to="/" className="sidebar-logo">
                    <img src="/logo.png" alt="STENNA" style={{ width: '100%', maxWidth: '180px', height: 'auto' }} />
                </Link>
            </div>

            {/* Breadcrumb Navigation */}
            {breadcrumb.length > 0 && (
                <div className="zara-breadcrumb" style={{ fontSize: '0.6rem' }}>
                    {breadcrumb.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.path ? (
                                <Link to={item.path}>{item.label}</Link>
                            ) : (
                                <span>{item.label}</span>
                            )}
                            {index < breadcrumb.length - 1 && ' / '}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Prominent Catalog Link (Home Only) */}
            {isHome && (
                <div style={{ marginBottom: '0.5rem', marginTop: '-0.5rem' }}>
                    <Link to="/catalog" className="text-action" style={{
                        color: '#000',
                        textDecoration: 'none',
                        borderBottom: '1px solid #000',
                        paddingBottom: '2px',
                        display: 'inline-block'
                    }}>
                        Catalog
                    </Link>
                </div>
            )}

            {/* Optional Filter Sections */}
            {showFilters && (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <GroupList
                            groups={groups}
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={onToggleGroup}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <CategoryList
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggleCategory={onToggleCategory}
                        />
                    </div>

                    <div className="zara-bottom-controls">
                        <button className="filter-word-btn text-action" onClick={onOpenFilters} style={{ textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
                            Filters
                        </button>

                        <div className="text-nav" style={{ opacity: 0.4, fontSize: 'var(--fs-tiny)', marginTop: '0.5rem' }}>
                            {loading ? "Refreshing..." : count !== null ? `${count} Artworks Found` : ""}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SidebarLeft;
