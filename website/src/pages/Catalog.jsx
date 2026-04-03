import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Layout, Search, User } from 'lucide-react';
import '../styles/App.css';
import '../styles/CatalogLayout.css';
import { fetchGroups, fetchCategories, fetchWallpapers, fetchBooks } from '../services/api';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
import BookList from '../components/BookList';
import WallpaperList from '../components/WallpaperList';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

// Utility for client-side randomization
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const Catalog = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [books, setBooks] = useState([]);
    const [wallpapers, setWallpapers] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [selectedBookIds, setSelectedBookIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [allCategories, setAllCategories] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load for groups, categories, and URL sync
    useEffect(() => {
        document.title = 'Catalog | Stenna';
        
        const initializeCatalog = async () => {
            try {
                // 1. Fetch metadata first (fast)
                const [groupsData, catsData, booksData] = await Promise.all([
                    fetchGroups(),
                    fetchCategories(),
                    fetchBooks()
                ]);
                
                setGroups(groupsData);
                setAllCategories(catsData);
                setBooks(booksData);
                setCategories(catsData);

                // 2. Sync URL params to local state immediately
                const groupParam = searchParams.get('group');
                const catParam = searchParams.get('category');
                const bookParam = searchParams.get('book');
                const searchParam = searchParams.get('search');

                if (groupParam) setSelectedGroupIds([groupParam]);
                if (catParam) setSelectedCategoryIds([catParam]);
                if (bookParam) setSelectedBookIds([bookParam]);

                if (searchParam || searchParams.get('search-open')) {
                    setSearchQuery(searchParam || '');
                    setDebouncedSearch(searchParam || '');
                    if (searchParams.get('search-open')) {
                        setIsSearchOpen(true);
                    }
                }

                // 3. Mark as initialized so the main wallpaper fetch can start once
                setIsInitialized(true);
            } catch (error) {
                console.error("Error initializing catalog:", error);
                setLoading(false);
            }
        };

        initializeCatalog();

        const handleToggleFilter = () => setIsFilterOpen(prev => !prev);
        const handleToggleSearch = () => setIsSearchOpen(prev => !prev);
        window.addEventListener('toggle-catalog-filter', handleToggleFilter);
        window.addEventListener('toggle-catalog-search', handleToggleSearch);

        return () => {
            window.removeEventListener('toggle-catalog-filter', handleToggleFilter);
            window.removeEventListener('toggle-catalog-search', handleToggleSearch);
        };
    }, []); // Only run ONCE on mount

    // Handle search debounce
    useEffect(() => {
        if (!isInitialized) return;
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, isInitialized]);

    // This hook now only runs the wallpaper fetch after initialization is complete
    useEffect(() => {
        if (!isInitialized) return;

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
                    setCategories(allCategories);
                }

                const walls = await fetchWallpapers({
                    groupIds: selectedGroupIds,
                    categoryIds: selectedCategoryIds,
                    bookIds: selectedBookIds,
                    search: debouncedSearch
                });
                // Randomize for fresh experience
                setWallpapers(shuffleArray(walls));
            } catch (error) {
                console.error("Error loading filtered data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadFilteredData();
    }, [selectedGroupIds, selectedCategoryIds, debouncedSearch, allCategories, isInitialized]);

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

    const handleToggleBook = (bookId) => {
        if (bookId === null) {
            setSelectedBookIds([]);
            return;
        }
        setSelectedBookIds(prev =>
            prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
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
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'CATALOG' }]}
                    groups={groups}
                    selectedGroupIds={selectedGroupIds}
                    onToggleGroup={handleToggleGroup}
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onToggleCategory={handleToggleCategory}
                    onOpenFilters={() => setIsFilterOpen(true)}
                    count={wallpapers.length}
                    loading={loading}
                    showFilters={true}
                />

                {/* COLUMN 2: SCROLLABLE GRID */}
                <div className="col-main-content">
                    {loading && wallpapers.length === 0 ? (
                        <div className="loading" style={{ padding: '10rem 0' }}>LOADING...</div>
                    ) : (
                        <>
                            <WallpaperList wallpapers={wallpapers} isAlternating={false} />
                            <Footer style={{ marginTop: '2rem' }} />
                        </>
                    )}
                </div>

                <SidebarRight
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    user={user}
                />
            </div>
        </div>
    );
};

export default Catalog;
