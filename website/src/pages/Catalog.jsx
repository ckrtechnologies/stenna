import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Layout, Search, User, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const [selectedTag, setSelectedTag] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [visibleCount, setVisibleCount] = useState(isMobile ? 12 : 24);
    const mainContentRef = useRef(null);
    const loadMoreRef = useRef(null);

    // Failsafe & Robust Infinite Scroll Logic
    useEffect(() => {
        // --- 1. Standard IntersectionObserver (Efficient) ---
        const root = isMobile ? null : mainContentRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && wallpapers.length > visibleCount) {
                    setVisibleCount(prev => prev + 24);
                }
            },
            { 
                root: root,
                threshold: 0,
                rootMargin: isMobile ? '400px' : '1000px'
            }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        // --- 2. Failsafe Polling for Desktop (100% Reliable) ---
        let failsafe;
        if (!isMobile) {
            failsafe = setInterval(() => {
                if (loadMoreRef.current && mainContentRef.current) {
                    const rect = loadMoreRef.current.getBoundingClientRect();
                    const containerRect = mainContentRef.current.getBoundingClientRect();
                    // If sentinel is near or inside container view
                    if (rect.top <= containerRect.bottom + 800) {
                        if (wallpapers.length > visibleCount) {
                            setVisibleCount(prev => prev + 24);
                        }
                    }
                }
            }, 1500);
        }

        return () => {
            observer.disconnect();
            if (failsafe) clearInterval(failsafe);
        };
    }, [wallpapers.length, visibleCount, isMobile]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                const tagParam = searchParams.get('tag');
                const searchParam = searchParams.get('search');

                // Determine effective Group IDs from URL (ID or Slug)
                let initialGroupIds = [];
                if (groupParam) {
                    const matchedGroup = groupsData.find(g => g.id.toString() === groupParam || g.slug === groupParam);
                    initialGroupIds = matchedGroup ? [matchedGroup.id.toString()] : [groupParam];
                } else if (catParam) {
                    const cat = catsData.find(c => c.id.toString() === catParam);
                    if (cat?.group_id) initialGroupIds = [cat.group_id.toString()];
                }
                setSelectedGroupIds(initialGroupIds);

                if (catParam) setSelectedCategoryIds([catParam]);
                if (bookParam) setSelectedBookIds([bookParam]);
                if (tagParam) setSelectedTag(tagParam);

                if (searchParam || searchParams.get('search-open')) {
                    setSearchQuery(searchParam || '');
                    setDebouncedSearch(searchParam || '');
                    if (searchParams.get('search-open')) {
                        setIsSearchOpen(true);
                    }
                }

                // 3. Mark as initialized
                setIsInitialized(true);
            } catch (error) {
                console.error("Initialization error:", error);
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

    // --- NEW: COMPREHENSIVE URL SYNC ---
    // This effect ensures that all menu navigations (which change the URL) 
    // correctly reflect in the catalog state and SidebarLeft.
    useEffect(() => {
        if (!isInitialized) return;

        const tagParam = searchParams.get('tag');
        const groupParam = searchParams.get('group');
        const catParam = searchParams.get('category');
        const bookParam = searchParams.get('book');

        // Update Tag
        setSelectedTag(tagParam);

        // --- IMPROVED: GROUP RESOLUTION (BY ID OR SLUG) ---
        let effectiveGroupIds = [];
        if (groupParam) {
            // 1. Try to find a group that matches the ID or the Slug
            const matchedGroup = groups.find(g => 
                g.id.toString() === groupParam || 
                g.slug === groupParam
            );
            
            if (matchedGroup) {
                effectiveGroupIds = [matchedGroup.id.toString()];
            } else {
                // Fallback for direct IDs if no match found in list
                effectiveGroupIds = [groupParam];
            }
        } 
        // If we have a category, find its parent group to filter the sidebar
        else if (catParam) {
            const cat = allCategories.find(c => c.id.toString() === catParam);
            if (cat?.group_id) {
                effectiveGroupIds = [cat.group_id.toString()];
            }
        }
        setSelectedGroupIds(effectiveGroupIds);

        // Update Category (Room/Style)
        setSelectedCategoryIds(catParam ? [catParam] : []);

        // Update Book
        setSelectedBookIds(bookParam ? [bookParam] : []);

        // Reset pagination when any navigation happens
        setVisibleCount(isMobile ? 12 : 24);
    }, [searchParams, isInitialized, allCategories, groups, isMobile]);

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
                    search: debouncedSearch,
                    tag: selectedTag
                });

                // Randomize for fresh experience ONLY if no specific sorting tag is applied
                // This preserves 'new_arrival' chronological order and 'limited_stock' urgency.
                if (selectedTag) {
                    setWallpapers(walls);
                } else {
                    setWallpapers(shuffleArray(walls));
                }
                setVisibleCount(isMobile ? 12 : 24); // Reset pagination on filter change
            } catch (error) {
                console.error("Error loading filtered data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadFilteredData();
    }, [selectedGroupIds, selectedCategoryIds, debouncedSearch, allCategories, isInitialized, selectedTag]);

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
                <div ref={mainContentRef} className="col-main-content">
                    {loading && wallpapers.length === 0 ? (
                        <div className="loading" style={{ padding: '10rem 0' }}>LOADING...</div>
                    ) : (
                        <>
                            <WallpaperList wallpapers={wallpapers.slice(0, visibleCount)} isAlternating={false} />

                            {wallpapers.length > visibleCount && (
                                <div className="related-view-more" ref={loadMoreRef} style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
                                    <motion.div
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <ChevronDown size={28} style={{ margin: '0 auto' }} />
                                    </motion.div>
                                    <span style={{ fontSize: '0.75rem', letterSpacing: '1px', display: 'block', marginTop: '0.5rem' }}>SCROLL FOR MORE</span>
                                </div>
                            )}

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
