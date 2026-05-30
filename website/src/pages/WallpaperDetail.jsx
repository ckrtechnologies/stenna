import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWallpaperBySlug, fetchWallpapers, fetchGroups, fetchCategories } from '../services/api';
import { supabase } from '../services/supabaseClient';
import RelatedProductCarousel from '../components/RelatedProductCarousel';
import VisualizerModal from '../components/VisualizerModal';
import EnquiryModal from '../components/EnquiryModal';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import FloatingProductBar from '../components/FloatingProductBar';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
    Sparkles, Layout, Search, User, CheckCircle, XCircle,
    Home, Heart, Star, Smile, Coffee, Feather, Zap,
    Camera, Book, Brush, Sun,
    ShieldCheck, Clock, ChevronDown
} from 'lucide-react';
import '../styles/App.css';
import '../styles/CatalogLayout.css';

// Utility for client-side randomization
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// --- Storytelling Helpers ---
const getIconForItem = (item) => {
    const text = (item || '').toLowerCase();
    if (text.includes('living')) return <Home size={14} />;
    if (text.includes('bedroom')) return <Star size={14} />;
    if (text.includes('office')) return <Book size={14} />;
    if (text.includes('meditation') || text.includes('peace') || text.includes('serene')) return <Sun size={14} />;
    if (text.includes('floral')) return <Sparkles size={14} />;
    if (text.includes('texture') || text.includes('artistic')) return <Brush size={14} />;
    if (text.includes('modern') || text.includes('luxury')) return <Zap size={14} />;
    if (text.includes('family') || text.includes('warm') || text.includes('cozy')) return <Heart size={14} />;
    if (text.includes('morning') || text.includes('refreshing')) return <Coffee size={14} />;
    if (text.includes('light') || text.includes('soft')) return <Feather size={14} />;
    return <Sparkles size={14} />;
};

const WallpaperDetail = () => {
    const { user } = useAuth();
    const { slug } = useParams();
    const navigate = useNavigate();
    const [wallpaper, setWallpaper] = useState(null);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    useEffect(() => {
        if (wallpaper) {
            document.title = `${wallpaper.name} | Stenna`;
            console.log("Wallpaper Object Loaded:", wallpaper);
            console.log("Videos available:", wallpaper.videos);
        }
    }, [wallpaper]);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('ABOUT');
    const [bookCode, setBookCode] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [activeImage, setActiveImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [timeLapseProduct, setTimeLapseProduct] = useState(null);
    const [isTimeLapsing, setIsTimeLapsing] = useState(false);
    const [isScrollingManual, setIsScrollingManual] = useState(false);
    const [dynamicPadding, setDynamicPadding] = useState(80); // Starts at 5rem (80px)

    // Scroll active thumbnail into view
    useEffect(() => {
        if (isGalleryOpen) {
            document.getElementById(`thumb-dot-${activeImage}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }, [activeImage, isGalleryOpen]);

    // Scroll-linked thumbnail tracking
    useEffect(() => {
        if (!isGalleryOpen || isZoomed) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrollingManual) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.id.split('-')[2]);
                        if (!isNaN(index)) {
                            setActiveImage(index);
                        }
                    }
                });
            },
            { threshold: 0.6 }
        );

        const items = document.querySelectorAll('.gallery-stack-img');
        items.forEach((item) => observer.observe(item));

        return () => observer.disconnect();
    }, [isGalleryOpen, isZoomed, isScrollingManual]);

    const [productList, setProductList] = useState([]);
    const [navList, setNavList] = useState([]); // ordered collection list for swipe navigation
    const [listLoading, setListLoading] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const prevSlugRef = useRef(slug);
    const mainContentRef = useRef(null);
    const loadMoreRef = useRef(null);
    const heroInnerRef = useRef(null); // ref for non-passive touchmove

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [swipeDirection, setSwipeDirection] = useState(0); // -1 for left, 1 for right

    // Hero swipe state (mobile/tablet only)
    const [heroDragX, setHeroDragX] = useState(0);
    const [heroSwiping, setHeroSwiping] = useState(false);
    const heroTouchStartXRef = useRef(null);  // refs avoid stale closure in native listener
    const heroTouchStartYRef = useRef(null);
    const heroSwipingRef = useRef(false);
    const HERO_SWIPE_THRESHOLD = 60;
    const HERO_DRAG_MAX = 120;
    const [visibleCount, setVisibleCount] = useState(12); // Always start with 12 items (unlimitedrows)

    // Aggressive Preload of Adjacent Images for Zero-Latency Swiping
    useEffect(() => {
        const list = navList.length > 1 ? navList : productList;
        if (!list || list.length === 0) return;

        const currentIndex = list.findIndex(p => p.slug === slug);
        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % list.length;
        const prevIndex = (currentIndex - 1 + list.length) % list.length;

        const nextImageUrl = list[nextIndex]?.images?.[0]?.image_url;
        const prevImageUrl = list[prevIndex]?.images?.[0]?.image_url;

        if (nextImageUrl) {
            const imgNext = new Image();
            imgNext.src = nextImageUrl;
        }
        if (prevImageUrl) {
            const imgPrev = new Image();
            imgPrev.src = prevImageUrl;
        }
    }, [slug, navList, productList]);

    // Failsafe & Robust Infinite Scroll Logic
    useEffect(() => {
        // --- 1. Standard IntersectionObserver (Efficient) ---
        // Always use null (viewport) as root to ensure consistent behavior across devices
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && productList.length > visibleCount) {
                    setVisibleCount(prev => prev + 12);
                }
            },
            {
                root: null, // Viewport
                threshold: 0,
                rootMargin: '1000px' // High margin for smoother loading
            }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        // --- 2. Failsafe Polling (100% Reliable for all devices) ---
        const failsafe = setInterval(() => {
            if (loadMoreRef.current) {
                const rect = loadMoreRef.current.getBoundingClientRect();

                // On mobile, the scroller is the window. On desktop, it's mainContentRef.
                // rect.top <= window.innerHeight covers both cases when mainContentRef handles scroll naturally
                if (rect.top <= window.innerHeight + 1000) {
                    if (productList.length > visibleCount) {
                        setVisibleCount(prev => prev + 12);
                    }
                }
            }
        }, 1500);

        return () => {
            observer.disconnect();
            clearInterval(failsafe);
        };
    }, [productList.length, visibleCount]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        const handleOpenVisualizer = () => {
            if (!user) {
                // Save current URL to redirect back after login
                navigate('/login', { state: { from: { pathname: window.location.pathname } } });
                return;
            }
            setIsVisualizerOpen(true);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('open-visualizer', handleOpenVisualizer);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('open-visualizer', handleOpenVisualizer);
        };
    }, [user, navigate]);

    useEffect(() => {
        const mainDiv = mainContentRef.current;
        if (!mainDiv) return;

        const handleScroll = () => {
            const stuck = mainDiv.scrollTop;
            const newPadding = Math.max(0, 80 - stuck);
            if (newPadding !== dynamicPadding) {
                setDynamicPadding(newPadding);
            }
        };

        mainDiv.addEventListener('scroll', handleScroll);
        return () => mainDiv.removeEventListener('scroll', handleScroll);
    }, [dynamicPadding]);

    useEffect(() => {
        const loadData = async () => {
            // Scroll to top immediately when slug changes (e.g., navigation from suggested wallpapers)
            window.scrollTo(0, 0);
            if (mainContentRef.current) {
                mainContentRef.current.scrollTo(0, 0);
            }

            const cachedProduct = productList.find(p => p.slug === slug);
            const prevSlug = prevSlugRef.current;
            prevSlugRef.current = slug;

            // Time-Lapse Detection & Sequence
            if (productList.length > 0 && prevSlug && prevSlug !== slug) {
                const prevIndex = productList.findIndex(p => p.slug === prevSlug);
                const nextIndex = productList.findIndex(p => p.slug === slug);

                // Only time-lapse if we jump more than 1 item (not a direct neighbor swipe)
                if (prevIndex !== -1 && nextIndex !== -1 && Math.abs(nextIndex - prevIndex) > 1) {
                    setIsTimeLapsing(true);
                    const direction = nextIndex > prevIndex ? 1 : -1;
                    const intermediates = [];
                    // Max 8 intermediate flashes to keep it snappy
                    const step = Math.max(1, Math.floor(Math.abs(nextIndex - prevIndex) / 8));

                    for (let i = prevIndex + (direction * step);
                        direction > 0 ? i < nextIndex : i > nextIndex;
                        i += (direction * step)) {
                        intermediates.push(productList[i]);
                    }

                    // Rapid Cycle sequence
                    for (const item of intermediates) {
                        setTimeLapseProduct(item);
                        await new Promise(resolve => setTimeout(resolve, 30)); // Snappier flash
                    }

                    // Small pause on the last intermediate to build tension before final reveal
                    await new Promise(resolve => setTimeout(resolve, 20));

                    setIsTimeLapsing(false);
                    setTimeLapseProduct(null);
                }
            }

            if (cachedProduct) {
                // Instant update - use cached basic info to avoid loading screen
                setWallpaper(prev => ({
                    ...cachedProduct,
                    // Preserve existing full data if we had it, but prioritize new basic info
                    ...(prev?.slug === slug ? prev : {})
                }));
                // We're already "loaded" as far as the user is concerned
                setLoading(false);
            } else {
                // Truly new view or collection jump - show loader
                setLoading(true);
            }

            try {
                // Background (or foreground if truly new) fetch for full metadata
                const data = await fetchWallpaperBySlug(slug);
                setWallpaper(data);

                if (data.images && data.images.length > 0) {
                    setActiveImage(0);
                }

                // Tiered Related Wallpapers Logic
                setListLoading(true);

                // Fetch metadata for classification (groups & categories)
                const [groupsData, catsData] = await Promise.all([
                    fetchGroups(),
                    fetchCategories()
                ]);

                setGroups(groupsData);
                setAllCategories(catsData);
                setCategories(catsData);

                // Identify color and style group IDs
                const colorGroupIds = groupsData
                    .filter(g => /color|palette|shade|hue/i.test(g.name))
                    .map(g => g.id);
                const styleGroupIds = groupsData
                    .filter(g => /style|vibe|look|aesthetic|theme/i.test(g.name))
                    .map(g => g.id);

                // Get current wallpaper's categories categorized by type
                const currentColCats = data.categories?.filter(c => colorGroupIds.includes(c.group_id)).map(c => c.id) || [];
                const currentStyleCats = data.categories?.filter(c => styleGroupIds.includes(c.group_id)).map(c => c.id) || [];
                const currentCollectionIds = data.groups?.filter(g => !colorGroupIds.includes(g.id) && !styleGroupIds.includes(g.id)).map(g => g.id) || [];

                // Sequential Tiered Fetching
                const [tier1, tier2, tier3] = await Promise.all([
                    // Tier 1: Collection match
                    currentCollectionIds.length > 0
                        ? fetchWallpapers({ groupIds: currentCollectionIds })
                        : Promise.resolve([]),
                    // Tier 2: Color match
                    currentColCats.length > 0
                        ? fetchWallpapers({ categoryIds: currentColCats })
                        : Promise.resolve([]),
                    // Tier 3: Style match
                    currentStyleCats.length > 0
                        ? fetchWallpapers({ categoryIds: currentStyleCats })
                        : Promise.resolve([])
                ]);

                // Combine, prioritize and deduplicate using ID as key
                const uniqueRelated = new Map();

                // Tier 1: Collections (Highest priority)
                tier1.forEach(item => { if (item.slug !== slug) uniqueRelated.set(item.id, item); });
                // Tier 2: Color
                tier2.forEach(item => { if (item.slug !== slug && !uniqueRelated.has(item.id)) uniqueRelated.set(item.id, item); });
                // Tier 3: Style
                tier3.forEach(item => { if (item.slug !== slug && !uniqueRelated.has(item.id)) uniqueRelated.set(item.id, item); });

                // If still too few, add general category matches
                if (uniqueRelated.size < 20 && data.categories?.length > 0) {
                    const allCatMatches = await fetchWallpapers({ categoryIds: data.categories.map(c => c.id) });
                    allCatMatches.forEach(item => { if (item.slug !== slug && !uniqueRelated.has(item.id)) uniqueRelated.set(item.id, item); });
                }

                // Final list (No slice(0, 50) as per user request for "unlimited")
                const randomizedList = shuffleArray(Array.from(uniqueRelated.values()));
                setProductList(randomizedList);
                setListLoading(false);

                // Build ordered navigation list (INCLUDES current wallpaper) from same-collection peers
                // Sorted by design_code so swipe order is predictable
                const navItems = [data, ...tier1.filter(item => item.slug !== data.slug)];
                navItems.sort((a, b) => (a.design_code || '').localeCompare(b.design_code || '', undefined, { numeric: true }));
                setNavList(navItems);

                // Set initial selection based on current wallpaper
                if (data.groups?.[0]?.id) setSelectedGroupIds([data.groups[0].id.toString()]);
                if (data.categories?.[0]?.id) setSelectedCategoryIds([data.categories[0].id.toString()]);

                // Fetch book code from separate 'books' table via 'book_wallpapers' join table
                const { data: relData } = await supabase
                    .from('book_wallpapers')
                    .select('book:books(code)')
                    .eq('wallpaper_id', data.id)
                    .maybeSingle();

                if (relData?.book?.code) {
                    setBookCode(relData.book.code);
                } else if (data.groups?.[0]?.code) {
                    setBookCode(data.groups[0].code);
                } else if (data.book_code) {
                    setBookCode(data.book_code);
                } else {
                    setBookCode(''); // Reset if no code found
                }

            } catch (err) {
                // Only show error if we don't even have cached data
                if (!cachedProduct) setError(err.message);
                console.error("Background sync error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        window.scrollTo(0, 0);

        const handleToggleSearch = () => setIsSearchOpen(prev => !prev);
        const handleToggleFilter = () => setIsFilterOpen(prev => !prev);
        window.addEventListener('toggle-catalog-search', handleToggleSearch);
        window.addEventListener('toggle-catalog-filter', handleToggleFilter);
        return () => {
            window.removeEventListener('toggle-catalog-search', handleToggleSearch);
            window.removeEventListener('toggle-catalog-filter', handleToggleFilter);
        };
    }, [slug]);

    const handleToggleGroup = (groupId) => {
        navigate(`/catalog?group=${groupId}`);
    };

    const handleToggleCategory = (categoryId) => {
        navigate(`/catalog?category=${categoryId}`);
    };

    const handleMobileSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsSearchOpen(false);
            navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Global touch handlers — no gallery swipe (gallery uses native vertical scroll)
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        // Gallery handles its own scroll — no horizontal swipe here
        setTouchStart(null);
    };

    // ── Hero-image-only swipe handlers (mobile/tablet) ──────────────────────
    // touchmove is handled via imperative listener (passive: false) in useEffect below
    const handleHeroTouchStart = (e) => {
        if (!isMobile) return;
        const touch = e.targetTouches[0];
        heroTouchStartXRef.current = touch.clientX;
        heroTouchStartYRef.current = touch.clientY;
        heroSwipingRef.current = false;
        setHeroDragX(0);
        setHeroSwiping(false);
    };

    const handleHeroTouchEnd = (e) => {
        if (!isMobile || heroTouchStartXRef.current === null) return;
        const dx = e.changedTouches[0].clientX - heroTouchStartXRef.current;

        if (Math.abs(dx) > HERO_SWIPE_THRESHOLD) {
            const list = navList.length > 1 ? navList : productList;
            const currentIndex = list.findIndex(p => p.slug === slug);
            if (currentIndex !== -1) {
                if (dx < 0) {
                    // Swipe Left → Next product
                    const nextIndex = (currentIndex + 1) % list.length;
                    setSwipeDirection(1);
                    navigate(`/wallpaper/${list[nextIndex].slug}`);
                } else {
                    // Swipe Right → Prev product
                    const prevIndex = (currentIndex - 1 + list.length) % list.length;
                    setSwipeDirection(-1);
                    navigate(`/wallpaper/${list[prevIndex].slug}`);
                }
            }
        }

        // Reset drag state
        heroTouchStartXRef.current = null;
        heroTouchStartYRef.current = null;
        heroSwipingRef.current = false;
        setHeroDragX(0);
        setHeroSwiping(false);
    };

    // Non-passive touchmove listener on hero div (required for e.preventDefault())
    useEffect(() => {
        const el = heroInnerRef.current;
        if (!el || !isMobile) return;

        const onTouchMove = (e) => {
            if (heroTouchStartXRef.current === null) return;
            const touch = e.targetTouches[0];
            const dx = touch.clientX - heroTouchStartXRef.current;
            const dy = touch.clientY - heroTouchStartYRef.current;

            // Let vertical scrolls pass through unless we've already confirmed horizontal
            if (Math.abs(dy) > Math.abs(dx) && !heroSwipingRef.current) return;

            if (Math.abs(dx) > 10) {
                e.preventDefault(); // works because listener is non-passive
                if (!heroSwipingRef.current) {
                    heroSwipingRef.current = true;
                    setHeroSwiping(true);
                }
            }

            const capped = Math.sign(dx) * Math.min(Math.abs(dx) * 0.6, HERO_DRAG_MAX);
            setHeroDragX(capped);
        };

        el.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => el.removeEventListener('touchmove', onTouchMove);
    }, [isMobile]);

    if (loading) return <div className="loading" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', padding: '10rem 0', textAlign: 'center' }}>LOADING...</div>;
    if (error) return <div className="error" style={{ textAlign: 'center', padding: '10rem 0', fontSize: '0.7rem', textTransform: 'uppercase' }}>{error}</div>;
    if (!wallpaper) return null;

    const firstGroupId = wallpaper.groups?.[0]?.id;
    const firstCategoryId = wallpaper.categories?.[0]?.id;

    return (
        <div className="catalog-page fade-in-up" style={{ paddingTop: 0 }}>
            {/* Mobile Search Bar Section */}
            <div className={`mobile-search-bar ${isSearchOpen ? 'open' : ''}`}>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="SEARCH ARTWORKS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleMobileSearch}
                        className="mobile-search-input"
                        autoFocus={isSearchOpen}
                    />
                    <span className="search-label-right">SEARCH</span>
                </div>
            </div>

            {/* Filter Overlay & Drawer */}
            <div className={`filter-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}></div>
            <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
                <div className="filter-header">
                    <button className="btn-close-filter" onClick={() => setIsFilterOpen(false)}>&times;</button>
                    <h2 className="zara-label">FILTERS</h2>
                </div>

                <div className="filter-content-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="filter-section">
                        <GroupList groups={groups} selectedGroupIds={selectedGroupIds} onToggleGroup={(id) => {
                            handleToggleGroup(id);
                            setIsFilterOpen(false);
                        }} />
                    </div>
                    <div className="filter-section" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '2rem' }}>
                        <CategoryList categories={allCategories} selectedCategoryIds={selectedCategoryIds} onToggleCategory={(id) => {
                            handleToggleCategory(id);
                            setIsFilterOpen(false);
                        }} />
                    </div>
                </div>
            </div>

            <div className="desktop-layout-container is-detail-view" style={{ paddingTop: '0', marginTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'CATALOG', path: '/catalog' }, { label: wallpaper?.name }]}
                    groups={groups}
                    selectedGroupIds={selectedGroupIds}
                    onToggleGroup={handleToggleGroup}
                    categories={allCategories}
                    selectedCategoryIds={selectedCategoryIds}
                    onToggleCategory={handleToggleCategory}
                    showFilters={true}
                />

                {/* COLUMN 2: MAIN DETAIL CONTENT */}
                <div ref={mainContentRef} className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div
                        className="detail-page"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        style={{
                            touchAction: 'pan-y',
                            paddingTop: `${dynamicPadding}px`,
                            transition: 'padding-top 0.05s linear'
                        }}
                    >
                        <VisualizerModal
                            isOpen={isVisualizerOpen}
                            onClose={() => setIsVisualizerOpen(false)}
                            wallpaper={wallpaper}
                        />
                        <EnquiryModal
                            isOpen={isEnquiryOpen}
                            onClose={() => setIsEnquiryOpen(false)}
                            wallpaper={wallpaper}
                        />

                        {/* Gallery Modal — vertical scroll only, no pinch/zoom/drag */}
                        <AnimatePresence>
                            {isGalleryOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="gallery-modal"
                                >
                                    <button className="gallery-close" onClick={() => setIsGalleryOpen(false)}>&times;</button>

                                    {/* Left-side vertical thumbnail strip (old position) */}
                                    <div className="gallery-sidebar">
                                        {wallpaper.images?.map((img, idx) => (
                                            <div
                                                key={idx}
                                                id={`thumb-dot-${idx}`}
                                                className={`gallery-thumb ${activeImage === idx ? 'active' : ''}`}
                                                onClick={() => {
                                                    setIsScrollingManual(true);
                                                    document.getElementById(`gallery-img-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    setActiveImage(idx);
                                                    setTimeout(() => setIsScrollingManual(false), 800);
                                                }}
                                            >
                                                <img src={img.image_url} alt="" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Scrollable vertical image stack — touch-action:pan-y blocks horizontal swipe & pinch */}
                                    <div className="gallery-scroll-stack">
                                        {wallpaper.images?.map((img, idx) => (
                                            <img
                                                key={idx}
                                                id={`gallery-img-${idx}`}
                                                src={img.image_url}
                                                alt={`${wallpaper.name} — view ${idx + 1}`}
                                                className="gallery-stack-img"
                                            />
                                        ))}
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Time-Lapse Overlay (Enhanced for both Product and Image jumps) */}
                        <AnimatePresence>
                            {isTimeLapsing && timeLapseProduct && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'fixed',
                                        top: 0, left: 0, width: '100%', height: '100vh',
                                        zIndex: 20000, background: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <img
                                        src={timeLapseProduct.images?.[0]?.image_url}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px)', opacity: 0.8 }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="popLayout" custom={swipeDirection}>
                            <motion.div
                                key={slug}
                                custom={swipeDirection}
                                initial={{ x: swipeDirection > 0 ? "100%" : swipeDirection < 0 ? "-100%" : 0 }}
                                animate={{ x: 0 }}
                                exit={{ x: swipeDirection > 0 ? "-100%" : swipeDirection < 0 ? "100%" : 0 }}
                                transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                                className="detail-layout-container"
                                style={{ width: '100%', backgroundColor: '#fff', willChange: 'transform' }}
                            >
                                {/* Part 1: Hero Section — swipe enabled on mobile/tablet only */}
                                <div className="detail-hero-section">
                                    {wallpaper.images?.[0] && (
                                        <div
                                            ref={heroInnerRef}
                                            className="detail-hero-inner"
                                            onTouchStart={handleHeroTouchStart}
                                            onTouchEnd={handleHeroTouchEnd}
                                            style={{
                                                transform: isMobile ? `translateX(${heroDragX}px)` : 'none',
                                                transition: heroDragX === 0 ? 'transform 0.35s cubic-bezier(0.32,0.72,0,1)' : 'none',
                                                willChange: 'transform',
                                                touchAction: 'pan-y',
                                                cursor: isMobile ? 'grab' : 'zoom-in',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <img
                                                src={wallpaper.images[0].image_url}
                                                alt={wallpaper.name}
                                                className="detail-hero-image"
                                                onClick={() => {
                                                    setActiveImage(0);
                                                    setIsGalleryOpen(true);
                                                }}
                                                style={{ pointerEvents: heroSwiping ? 'none' : 'auto' }}
                                            />
                                            {wallpaper.groups?.some(g => g.name?.toLowerCase() === 'new') && (
                                                <span className="new-arrival-badge">NEW</span>
                                            )}

                                        </div>
                                    )}
                                </div>

                                {/* Part 2: Info Section */}
                                <div className="detail-info-section str-layout">
                                    {/* 1. Breadcrumbs (Clickable) */}
                                    <nav className="str-breadcrumb" aria-label="breadcrumb">
                                        <Link to="/">HOME</Link> / <Link to="/catalog">CATALOG</Link> / <span>{wallpaper.name || wallpaper.design_code}</span>
                                    </nav>

                                    {/* 2. Design Code + Book Name */}
                                    <div className="str-header-block">
                                        <div className="str-header-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <h1 className="str-title" style={{ display: 'flex', alignItems: 'center' }}>
                                                {wallpaper.design_code}
                                                {bookCode && (
                                                    <span className="zara-book-inline">
                                                        {bookCode}
                                                    </span>
                                                )}
                                            </h1>
                                            <div className="str-price-gst-row">
                                                <div className="str-price">Rs. {wallpaper.price || '0.00'}</div>
                                                <div className="zara-vat-info">inclusive of GST</div>
                                            </div>
                                        </div>
                                        {/* {wallpaper.swatch && (
                                            <div className="str-header-swatch">
                                                <img src={wallpaper.swatch} alt="Texture Preview" />
                                            </div>
                                        )} */}
                                    </div>

                                    {/* 2.1 Mobile Tab Navigation */}
                                    {isMobile && (
                                        <div className="str-mobile-tabs">
                                            {['ABOUT', 'SPECS', 'GUIDE'].map((tab) => (
                                                <button
                                                    key={tab}
                                                    className={`str-tab-btn ${activeTab === tab ? 'active' : ''}`}
                                                    onClick={() => setActiveTab(tab)}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <hr className="str-divider" />

                                    {/* 3. Tagline & Description & Vibe (ABOUT Tab) */}
                                    {(!isMobile || activeTab === 'ABOUT') && (
                                        <>
                                            {(wallpaper.tagline || wallpaper.subtitle) && (
                                                <>
                                                    <div className="str-section">
                                                        <h4 className="str-label">TAGLINE</h4>
                                                        <p className="str-tagline-text">{wallpaper.tagline || wallpaper.subtitle}</p>
                                                    </div>
                                                    <hr className="str-divider" />
                                                </>
                                            )}

                                            {wallpaper.description && (
                                                <>
                                                    <div className="str-section">
                                                        <h4 className="str-label">DESCRIPTION</h4>
                                                        <p className="str-body">{wallpaper.description}</p>
                                                    </div>
                                                    <hr className="str-divider" />
                                                </>
                                            )}

                                            {wallpaper.vibe && (
                                                <>
                                                    <div className="str-section">
                                                        <h4 className="str-label">VIBE</h4>
                                                        <div className="str-chips">
                                                            {wallpaper.vibe.split(/[\s•.]+/).filter(v => v.trim()).map((v, i) => (
                                                                <div key={i} className="str-chip">
                                                                    <span>{v.trim()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <hr className="str-divider" />
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* 4. Technical Specs & Guarantee (SPECS Tab) */}
                                    {(!isMobile || activeTab === 'SPECS') && (
                                        <>
                                            <div className="str-section">
                                                <h4 className="str-label">TECHNICAL SPECIFICATIONS</h4>
                                                <div className="str-specs">
                                                    <div className="str-spec">
                                                        <div className="str-spec-label">ROLL WIDTH</div>
                                                        <div className="str-spec-value">{wallpaper.roll_width + ' CM' || ' 106 CM'}</div>
                                                    </div>
                                                    <div className="str-spec">
                                                        <div className="str-spec-label">ROLL HEIGHT</div>
                                                        <div className="str-spec-value">{wallpaper.roll_height + ' MT' || '5 MT'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr className="str-divider" />

                                            <div className="str-section">
                                                <div className="features-guarantee-banner">
                                                    <img src="/details-icon.avif" alt="Features & Specifications" className="str-features-banner" />
                                                </div>
                                            </div>
                                            <hr className="str-divider" />
                                        </>
                                    )}

                                    {/* 5. Swatch & Guidance (GUIDE Tab) */}
                                    {(!isMobile || activeTab === 'GUIDE') && (
                                        <>
                                            {/* {wallpaper.swatch && (
                                                <>
                                                    <div className="str-section">
                                                        <h4 className="str-label">TEXTURE SWATCH</h4>
                                                        <div className="str-swatch-container">
                                                            <img src={wallpaper.swatch} alt="Texture Swatch" className="str-swatch" />
                                                        </div>
                                                    </div>
                                                    <hr className="str-divider" />
                                                </>
                                            )} */}

                                            <div className="str-section">
                                                <h4 className="str-label">CHOOSE THIS DESIGN IF_</h4>
                                                <ul className="str-list">
                                                    {(wallpaper.choose_if ? wallpaper.choose_if.split(/[|;]|\.(?=\s*[A-Z])|,\s*/) : [
                                                        "You seek a sophisticated, high-end atmosphere",
                                                        "You appreciate intricate textures and premium finishes",
                                                        "You want a durable, long-lasting wall covering",
                                                        "This design complements modern and contemporary furniture"
                                                    ]).filter(v => v && v.trim()).map((v, i) => (
                                                        <li key={i}>
                                                            <CheckCircle size={18} strokeWidth={2} className="str-icon-check" />
                                                            <span>{v.trim()}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <hr className="str-divider" />

                                            {wallpaper.ideal_for && (
                                                <>
                                                    <div className="str-section">
                                                        <h4 className="str-label">IDEAL FOR_</h4>
                                                        <ul className="str-list">
                                                            {(wallpaper.ideal_for ? wallpaper.ideal_for.split(/[|;]|\.(?=\s*[A-Z])|,\s*/) : [
                                                                "A sophisticated, high-end atmosphere",
                                                                "Intricate textures and premium finishes",
                                                                "Modern and contemporary furniture styles"
                                                            ]).filter(v => v && v.trim()).map((v, i) => (
                                                                <li key={i}>
                                                                    <Sparkles size={18} strokeWidth={2} className="str-icon-check" />
                                                                    <span>{v.trim()}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <hr className="str-divider" />
                                                </>
                                            )}
                                        </>
                                    )}

                                    <div className="str-actions">
                                        <button className="str-btn str-btn-dark" onClick={() => setIsVisualizerOpen(true)}>
                                            TRY ON MY WALL
                                        </button>
                                        <button className="str-btn str-btn-light" onClick={() => setIsEnquiryOpen(true)}>
                                            ENQUIRE FOR QUOTE
                                        </button>
                                    </div>
                                </div>

                                {/* Part 3: Residue Gallery Section */}
                                <div className="detail-residue-section">
                                    <div className="detail-image-grid">
                                        {wallpaper.images?.slice(1).map((img, idx) => (
                                            <img
                                                key={idx + 1}
                                                src={img.image_url}
                                                alt={`${wallpaper.name} ${idx + 1}`}
                                                className="detail-grid-image"
                                                onClick={() => {
                                                    setActiveImage(idx + 1);
                                                    setIsGalleryOpen(true);
                                                }}
                                            />
                                        ))}
                                        {wallpaper.videos?.map((vid, idx) => (
                                            <video
                                                key={`vid-${idx}`}
                                                src={vid.video_url}
                                                className="detail-grid-video"
                                                muted
                                                loop
                                                playsInline
                                                autoPlay
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* RELATED PRODUCTS SECTION */}
                        {!listLoading && productList.length > 0 && (
                            <section className="related-wallpapers-section">
                                <h2 className="related-title">SIMILAR WALLPAPERS YOU MAY LIKE {productList.length > 0 && `(${productList.filter(p => p.slug !== slug).length})`}</h2>
                                <div className="related-zara-grid">
                                    {productList.filter(p => p.slug !== slug).slice(0, visibleCount).map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ duration: 0.6, delay: (index % 12) * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                                        >
                                            <Link to={`/wallpaper/${item.slug}`} className="related-item" style={{ display: 'block', height: '100%' }}>
                                                <div className="related-img-container">
                                                    <img
                                                        src={item.images?.[0]?.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                        alt={item.name}
                                                        loading="lazy"
                                                    />
                                                    {(item.groups?.some(g => g.name?.toLowerCase() === 'new') ||
                                                        item.categories?.some(c => c.name?.toLowerCase() === 'new')) && (
                                                            <span className="new-arrival-badge">NEW</span>
                                                        )}
                                                </div>
                                                <div className="related-info">
                                                    <span className="related-name">{item.name}</span>
                                                    <span className="related-price">Rs. {item.price || '0.00'}</span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {productList.length > visibleCount && (
                                    <div className="related-view-more" ref={loadMoreRef} style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.6 }}>
                                        <motion.div
                                            animate={{ y: [0, 10, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            <ChevronDown size={28} style={{ margin: '0 auto' }} />
                                        </motion.div>
                                        <span style={{ fontSize: '0.75rem', letterSpacing: '1px', display: 'block', marginTop: '0.5rem' }}>SCROLL FOR MORE</span>
                                    </div>
                                )}
                            </section>
                        )}

                        {listLoading && (
                            <section className="related-wallpapers-section">
                                <h2 className="related-title">DISCOVER MORE</h2>
                                <div className="related-zara-grid">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="related-item skeleton-loader" style={{ height: '300px', background: '#f5f5f5' }}></div>
                                    ))}
                                </div>
                            </section>
                        )}
                        <Footer style={{ marginTop: '4rem', borderTop: '1px solid #f0f0f0' }} />
                    </div>
                </div>

                <SidebarRight
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    user={user}
                >
                    <div className="tool-section">
                        <h3>ACTIONS</h3>
                        <button
                            onClick={() => setIsEnquiryOpen(true)}
                            className="tool-link"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            ENQUIRE NOW
                        </button>
                    </div>
                </SidebarRight>
            </div>

            {/* Mobile Sticky Action Bar */}
            <div className="mobile-sticky-actions mobile-only">
                <button
                    className="mobile-action-btn primary"
                    onClick={() => setIsVisualizerOpen(true)}
                >
                    <Camera size={18} /> TRY ON WALL
                </button>
                <button
                    className="mobile-action-btn secondary"
                    onClick={() => setIsEnquiryOpen(true)}
                >
                    ENQUIRE
                </button>
            </div>
        </div>
    );
};

export default WallpaperDetail;
