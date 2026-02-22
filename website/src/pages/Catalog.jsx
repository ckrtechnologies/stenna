import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Layout, Search, User } from 'lucide-react';
import '../styles/App.css';
import '../styles/CatalogLayout.css';
import { fetchGroups, fetchCategories, fetchWallpapers } from '../services/api';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
import WallpaperList from '../components/WallpaperList';
import { useAuth } from '../context/AuthContext';

const Catalog = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallpapers, setWallpapers] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [allCategories, setAllCategories] = useState([]);

    // Initial load for groups and all categories
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [groupsData, catsData] = await Promise.all([
                    fetchGroups(),
                    fetchCategories()
                ]);
                setGroups(groupsData);
                setAllCategories(catsData);
                // Initial categories displayed (all)
                setCategories(catsData);
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };
        loadInitialData();

        const handleToggleFilter = () => setIsFilterOpen(prev => !prev);
        const handleToggleSearch = () => setIsSearchOpen(prev => !prev);

        window.addEventListener('toggle-catalog-filter', handleToggleFilter);
        window.addEventListener('toggle-catalog-search', handleToggleSearch);

        return () => {
            window.removeEventListener('toggle-catalog-filter', handleToggleFilter);
            window.removeEventListener('toggle-catalog-search', handleToggleSearch);
        };
    }, []);

    // Sync URL params to state
    useEffect(() => {
        const groupParam = searchParams.get('group');
        const catParam = searchParams.get('category');

        if (groupParam) setSelectedGroupIds([groupParam]);
        else setSelectedGroupIds([]);

        if (catParam) setSelectedCategoryIds([catParam]);
        else setSelectedCategoryIds([]);
    }, [searchParams]);

    // Handle search debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const loadFilteredData = async () => {
            setLoading(true);
            try {
                // Filter categories based on selected group
                if (selectedGroupIds.length > 0) {
                    const filteredCats = allCategories.filter(cat =>
                        selectedGroupIds.includes(cat.group_id?.toString())
                    );
                    setCategories(filteredCats);
                } else {
                    // If "VIEW ALL" is selected for groups, show all categories
                    setCategories(allCategories);
                }

                const walls = await fetchWallpapers({
                    groupIds: selectedGroupIds,
                    categoryIds: selectedCategoryIds,
                    search: debouncedSearch
                });
                setWallpapers(walls);
            } catch (error) {
                console.error("Error loading filtered data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadFilteredData();
    }, [selectedGroupIds, selectedCategoryIds, debouncedSearch, allCategories]);

    const handleToggleGroup = (groupId) => {
        if (groupId === null) {
            setSelectedGroupIds([]);
            setSelectedCategoryIds([]);
            return;
        }
        setSelectedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
        setSelectedCategoryIds([]);
    };

    const handleToggleCategory = (categoryId) => {
        if (categoryId === null) {
            setSelectedCategoryIds([]);
            return;
        }
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    };

    return (
        <div className="catalog-page fade-in-up">
            {/* Filter Overlay & Drawer */}
            <div className={`filter-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}></div>
            <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
                <div className="filter-header">
                    <button className="btn-close-filter" onClick={() => setIsFilterOpen(false)}>&times;</button>
                    <h2 className="zara-label">FILTERS</h2>
                </div>

                <div className="filter-content-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="filter-section">
                        <GroupList groups={groups} selectedGroupIds={selectedGroupIds} onToggleGroup={handleToggleGroup} />
                    </div>
                    <div className="filter-section" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '2rem' }}>
                        <CategoryList categories={categories} selectedCategoryIds={selectedCategoryIds} onToggleCategory={handleToggleCategory} />
                    </div>
                </div>

                {/* Pagination at the bottom of the tool panel */}
                <div className="pagination-container-drawer">
                    <button className="page-dot active"></button>
                    <button className="page-dot"></button>
                    <button className="page-dot"></button>
                </div>

                <button className="btn-view-results" onClick={() => setIsFilterOpen(false)}>
                    VIEW RESULTS
                </button>
            </div>

            {/* Mobile Search Bar Section */}
            <div className={`mobile-search-bar ${isSearchOpen ? 'open' : ''}`}>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="SEARCH ARTWORKS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mobile-search-input"
                        autoFocus={isSearchOpen}
                    />
                    <span className="search-label-right">SEARCH</span>
                    <button className="btn-close-search" onClick={() => setIsSearchOpen(false)}>&times;</button>
                </div>
            </div>

            <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                {/* COLUMN 1: FILTER TRIGGER */}
                <div className="col-filter-trigger desktop-only" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="zara-breadcrumb" style={{ fontSize: '0.6rem', marginBottom: '2rem' }}>
                        <Link to="/">HOME</Link> / <span>CATALOG</span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <GroupList groups={groups} selectedGroupIds={selectedGroupIds} onToggleGroup={handleToggleGroup} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <CategoryList categories={categories} selectedCategoryIds={selectedCategoryIds} onToggleCategory={handleToggleCategory} />
                    </div>

                    <div className="zara-bottom-controls">
                        <button className="filter-word-btn" onClick={() => setIsFilterOpen(true)} style={{ textAlign: 'left' }}>
                            FILTERS
                        </button>

                        <div style={{ opacity: 0.4, fontSize: '0.6rem', letterSpacing: '0.05em', marginTop: '1rem' }}>
                            {loading ? "REFRESHING..." : `${wallpapers.length} ARTWORKS FOUND`}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: SCROLLABLE GRID */}
                <div className="col-main-content">
                    {loading && wallpapers.length === 0 ? (
                        <div className="loading" style={{ padding: '10rem 0' }}>LOADING...</div>
                    ) : (
                        <WallpaperList wallpapers={wallpapers} isAlternating={false} />
                    )}
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <div className="col-tools-panel">
                    {/* Search Section */}
                    <div className="tool-section">
                        {/* <h3>SEARCH</h3> */}
                        <div style={{ position: 'relative', borderBottom: '1px solid #000' }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.1em',
                                    outline: 'none',
                                    textTransform: 'uppercase'
                                }}
                            />
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="tool-section">
                        <h3>DISCOVERY</h3>
                        <Link to="/try-it-on" className="tool-link">
                            <Layout size={16} /> TRY IT ON YOUR WALL
                        </Link>
                        <Link to="/ai-recommendations" className="tool-link">
                            <Sparkles size={16} /> AI RECOMMENDATIONS
                        </Link>
                    </div>

                    {/* User Section */}
                    <div className="tool-section">
                        <h3>ACCOUNT</h3>
                        <div className="user-display">
                            <User size={16} />
                            <span className="user-name-label">
                                {user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : "GUEST"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
