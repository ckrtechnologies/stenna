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
            height: '100vh',
            gap: '0.5rem', /* Reduced gap to pull View All closer */
            overflowY: 'auto',
            paddingRight: '10px',
            scrollbarWidth: 'none',
            paddingTop: '1.25rem' /* Closer to the top edge */
        }}>
            {/* Global Menu Trigger & Logo */}
            <div className="sidebar-brand-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
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
                    <img src="/logo.png" alt="STENNA" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </Link>
            </div>

            {/* Editorial Headers */}
            {/* <div className="sidebar-section">
                <span className="zara-sidebar-header sidebar-header-main">HOME</span>
                <span className="zara-sidebar-header sidebar-header-sub">CATALOG</span>
            </div> */}

            {/* Optional Filter Sections */}
            {showFilters && (
                <>
                    <div className="sidebar-section">
                        <GroupList
                            groups={groups}
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={onToggleGroup}
                        />
                    </div>

                    <hr className="sidebar-divider" />

                    <div className="sidebar-section">
                        <CategoryList
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggleCategory={onToggleCategory}
                        />
                    </div>

                    <div className="zara-bottom-controls" style={{ marginTop: '2rem' }}>
                        <button className="filter-word-btn text-action" onClick={onOpenFilters} style={{ textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
                            Filters
                        </button>

                        <div className="text-nav" style={{ opacity: 0.4, fontSize: '0.65rem', marginTop: '0.5rem' }}>
                            {loading ? "Refreshing..." : count !== null ? `${count} Wallpapers Found` : ""}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SidebarLeft;
