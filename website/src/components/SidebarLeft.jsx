import React from 'react';
import { Link } from 'react-router-dom';
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
    return (
        <div className="col-filter-trigger desktop-only" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '2rem' }}>
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
                    <img src="/logo.png" alt="STENNA" style={{ width: '100%', maxWidth: '120px', height: 'auto' }} />
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

            {/* Optional Filter Sections */}
            {showFilters && (
                <>
                    <div style={{ marginBottom: '2rem' }}>
                        <GroupList
                            groups={groups}
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={onToggleGroup}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <CategoryList
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggleCategory={onToggleCategory}
                        />
                    </div>

                    <div className="zara-bottom-controls">
                        <button className="filter-word-btn" onClick={onOpenFilters} style={{ textAlign: 'left' }}>
                            FILTERS
                        </button>

                        <div style={{ opacity: 0.4, fontSize: '0.6rem', letterSpacing: '0.05em', marginTop: '1rem' }}>
                            {loading ? "REFRESHING..." : count !== null ? `${count} ARTWORKS FOUND` : ""}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SidebarLeft;
