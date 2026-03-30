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
    Camera, Book, Brush, Sun
} from 'lucide-react';
import '../styles/App.css';
import '../styles/CatalogLayout.css';

// --- Storytelling Helpers ---
const getIconForItem = (item) => {
    const text = item.toLowerCase();
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
    const [activeTab, setActiveTab] = useState('about');
    const [bookCode, setBookCode] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeImage, setActiveImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [timeLapseProduct, setTimeLapseProduct] = useState(null);
    const [isTimeLapsing, setIsTimeLapsing] = useState(false);
    const [isScrollingManual, setIsScrollingManual] = useState(false);
    const [dynamicPadding, setDynamicPadding] = useState(80); // Starts at 5rem (80px)

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

        const items = document.querySelectorAll('.gallery-stack-item');
        items.forEach((item) => observer.observe(item));

        return () => observer.disconnect();
    }, [isGalleryOpen, isZoomed, isScrollingManual]);

    const [productList, setProductList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const prevSlugRef = useRef(slug);
    const mainContentRef = useRef(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [swipeDirection, setSwipeDirection] = useState(0); // -1 for left, 1 for right

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        const handleOpenVisualizer = () => setIsVisualizerOpen(true);

        window.addEventListener('resize', handleResize);
        window.addEventListener('open-visualizer', handleOpenVisualizer);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('open-visualizer', handleOpenVisualizer);
        };
    }, []);

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

                // If collection jump or new product, fetch related wallpapers
                const gId = data.groups?.[0]?.id;
                const cId = data.categories?.[0]?.id;

                if (gId || cId) {
                    setListLoading(true);
                    const listData = await fetchWallpapers({
                        groupIds: gId ? [gId] : [],
                        categoryIds: cId ? [cId] : [],
                        activeOnly: 'true'
                    });
                    // IMPORTANT: Keep ALL products including current for navigation lookup
                    setProductList(listData.slice(0, 50));
                    setListLoading(false);
                }

                // Initial load for groups and all categories
                const [groupsData, catsData] = await Promise.all([
                    fetchGroups(),
                    fetchCategories()
                ]);
                setGroups(groupsData);
                setAllCategories(catsData);
                setCategories(catsData);

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

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        const threshold = 80;

        if (Math.abs(diff) > threshold) {
            if (isGalleryOpen) {
                if (diff > 0) {
                    setActiveImage(prev => (prev + 1) % wallpaper.images.length);
                } else {
                    setActiveImage(prev => (prev - 1 + wallpaper.images.length) % wallpaper.images.length);
                }
                setIsZoomed(false);
            } else {
                const currentIndex = productList.findIndex(p => p.slug === slug);
                if (currentIndex === -1) return;

                if (diff > 0) {
                    // Swipe Left (Diff > 0) -> Next Product
                    const nextIndex = (currentIndex + 1) % productList.length;
                    setSwipeDirection(1);
                    navigate(`/wallpaper/${productList[nextIndex].slug}`);
                } else {
                    // Swipe Right (Diff < 0) -> Prev Product
                    const prevIndex = (currentIndex - 1 + productList.length) % productList.length;
                    setSwipeDirection(-1);
                    navigate(`/wallpaper/${productList[prevIndex].slug}`);
                }
            }
        }
        setTouchStart(null);
    };

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
                            transition: 'padding-top 0.05s linear' /* Smooth out scroll events */
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

                        {/* Premium Full-Screen Gallery Modal */}
                        <AnimatePresence>
                            {isGalleryOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="gallery-modal"
                                >
                                    <button className="gallery-close" onClick={() => setIsGalleryOpen(false)}>&times;</button>
                                    <div className="gallery-layout">
                                        <div className="gallery-sidebar">
                                            {wallpaper.images?.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`gallery-thumb ${activeImage === idx ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setIsScrollingManual(true);
                                                        setActiveImage(idx);
                                                        document.getElementById(`gallery-img-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
                                                        // Reset manual flag after scroll animation finishes
                                                        setTimeout(() => setIsScrollingManual(false), 800);
                                                    }}
                                                >
                                                    <img src={img.image_url} alt="Gallery Thumb" />
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            className="gallery-main"
                                            style={{
                                                overflow: isZoomed ? 'hidden' : 'auto',
                                                cursor: isZoomed ? 'grab' : 'zoom-in'
                                            }}
                                        >
                                            {wallpaper.images?.map((img, idx) => (
                                                <div key={idx} id={`gallery-img-${idx}`} className="gallery-stack-item">
                                                    <motion.img
                                                        src={img.image_url}
                                                        initial={{ opacity: 1, scale: 1 }}
                                                        whileInView={{ opacity: 1, scale: 1 }}
                                                        viewport={{ once: true }}
                                                        animate={{
                                                            scale: isZoomed ? (isMobile ? 3 : 2.5) : 1,
                                                            x: isZoomed ? undefined : 0,
                                                            y: isZoomed ? undefined : 0
                                                        }}
                                                        drag={isZoomed}
                                                        dragListener={isZoomed}
                                                        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                                                        dragElastic={0.1}
                                                        onTap={() => setIsZoomed(!isZoomed)}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="gallery-main-img"
                                                        style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
                                                    />
                                                </div>
                                            ))}

                                            {isZoomed && (
                                                <button
                                                    className="zoom-close-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsZoomed(false);
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
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

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slug}
                                initial={{ opacity: 0, x: swipeDirection > 0 ? 50 : swipeDirection < 0 ? -50 : 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: swipeDirection > 0 ? -50 : swipeDirection < 0 ? 50 : 0 }}
                                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                                className="detail-layout-container fade-in-up"
                            >
                                {/* Part 1: Hero Section */}
                                <div className="detail-hero-section">
                                    {wallpaper.images?.[0] && (
                                        <img
                                            src={wallpaper.images[0].image_url}
                                            alt={wallpaper.name}
                                            className="detail-hero-image"
                                            onClick={() => {
                                                setActiveImage(0);
                                                setIsGalleryOpen(true);
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Part 2: Info Section */}
                                <div className="detail-info-section">
                                    <h1 className="zara-detail-title">
                                        {wallpaper.design_code}
                                        {bookCode && (
                                            <span className="zara-book-number"> / (Books : {bookCode})</span>
                                        )}
                                    </h1>
                                    {/* {wallpaper.price && (
                            <>
                                <p className="zara-price">₹ {wallpaper.price}</p>
                                <p className="zara-vat-info">MRP INCL. OF ALL TAXES</p>
                            </>
                        )} */}                                     {/* ── Mobile Tab Bar ── */}
                                    {isMobile && (
                                        <div className="info-tab-bar">
                                            <button
                                                className={`info-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('about')}
                                            >
                                                About
                                            </button>
                                            <button
                                                className={`info-tab-btn ${activeTab === 'fit' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('fit')}
                                            >
                                                Wallpaper Guide
                                            </button>
                                        </div>
                                    )}

                                    {/* Swatch Section */}
                                    {wallpaper.swatch && (
                                        <div className="swatch-section" style={{ marginBottom: '2rem' }}>
                                            <h4 className="story-label">Texture Swatch</h4>
                                            <div className="swatch-preview">
                                                <img src={wallpaper.swatch} alt="Texture Swatch" />
                                            </div>
                                        </div>
                                    )}

                                    {/* ── About: Tagline + Vibe + Description ── */}
                                    <div className={isMobile ? (activeTab === 'about' ? 'info-tab-panel active' : 'info-tab-panel') : ''}>
                                        {/* Tagline */}
                                        {wallpaper.tagline && (
                                            <div className="story-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: '0.5rem' }}>
                                                <p className="story-tagline">{wallpaper.tagline}</p>
                                            </div>
                                        )}

                                        {/* Vibe */}
                                        {wallpaper.vibe && (
                                            <div className="story-section">
                                                <h4 className="story-label">Vibe</h4>
                                                <div className="story-chips">
                                                    {wallpaper.vibe.split(/[•.]/).filter(v => v.trim()).map((v, i) => (
                                                        <span key={i} className="story-chip">
                                                            {getIconForItem(v)}
                                                            {v.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {wallpaper.description && (
                                            <div className="story-section">
                                                <h4 className="story-label">Description</h4>
                                                <p className="story-text">{wallpaper.description}</p>
                                            </div>
                                        )}

                                        {/* Technical Specifications */}
                                        <div className="story-section">
                                            <h4 className="story-label">Technical Specifications</h4>
                                            <div className="spec-grid">
                                                <div className="spec-item">
                                                    <span className="spec-label">Roll Width</span>
                                                    <span className="spec-value">{wallpaper.roll_width || '53 CM'}</span>
                                                </div>
                                                <div className="spec-item">
                                                    <span className="spec-label">Roll Height</span>
                                                    <span className="spec-value">{wallpaper.roll_height || '10 MT'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fallback */}
                                        {!wallpaper.vibe && !wallpaper.description && (
                                            <div className="story-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                                                <p className="story-text" style={{ color: '#999' }}>{`Experience the luxury of ${wallpaper.name}. Designed for high-end interiors, this premium wallpaper combines texture and durability.`}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Fit Guide: Choose if + Avoid if + Ideal For ── */}
                                    <div className={isMobile ? (activeTab === 'fit' ? 'info-tab-panel active' : 'info-tab-panel') : ''}>
                                        {/* Choose this design if */}
                                        <div className="story-section" style={isMobile && activeTab === 'fit' ? { borderTop: 'none', paddingTop: 0 } : {}}>
                                            <h4 className="story-label">Choose this design if…</h4>
                                            <ul className="story-list">
                                                {(wallpaper.choose_if ? wallpaper.choose_if.split(/[|;]|\.(?=\s*[A-Z])|,\s*/) : [
                                                    "You seek a sophisticated, high-end atmosphere for your space",
                                                    "You appreciate intricate textures and premium finishes",
                                                    "You want a durable and long-lasting wall covering",
                                                    "This design complements modern and contemporary furniture",
                                                    "You seek a statement piece that transforms your entire room"
                                                ]).filter(v => v && v.trim()).map((v, i) => (
                                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                                        <CheckCircle size={16} className="fit-icon success" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                                                        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>{v.trim()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Avoid if */}
                                        <div className="story-section">
                                            <h4 className="story-label">Avoid if…</h4>
                                            <ul className="story-list">
                                                {(wallpaper.avoid_if ? wallpaper.avoid_if.split(/[|;]|\.(?=\s*[A-Z])|,\s*/) : [
                                                    "The wall surface has significant unaddressed dampness",
                                                    "You are looking for a completely smooth, non-textured surface",
                                                    "You prefer extremely high-contrast or neon color patterns",
                                                    "The room receives constant direct abrasive contact"
                                                ]).filter(v => v && v.trim()).map((v, i) => (
                                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                                        <XCircle size={16} className="fit-icon error" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                                                        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>{v.trim()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Ideal For */}
                                        <div className="story-section">
                                            <h4 className="story-label">Ideal For</h4>
                                            <ul className="story-list">
                                                {(wallpaper.ideal_for ? wallpaper.ideal_for.split(/[|;]|\.(?=\s*[A-Z])|,\s*/) : [
                                                    "Bedroom",
                                                    "Living Room",
                                                    "Hallway",
                                                    "Office Space",
                                                    "Feature Wall"
                                                ]).filter(v => v && v.trim()).map((v, i) => (
                                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                                        <span className="fit-icon success" style={{ display: 'flex', alignItems: 'center', marginTop: '0.2rem', flexShrink: 0 }}>
                                                            {getIconForItem(v)}
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>{v.trim()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Empty state for fit tab */}
                                        {isMobile && activeTab === 'fit' && !wallpaper.choose_if && !wallpaper.avoid_if && !wallpaper.ideal_for && (
                                            <div className="story-section" style={{ borderTop: 'none', paddingTop: 0 }}>
                                                <p className="story-text" style={{ color: '#bbb' }}>No fit guide available for this design.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="zara-detail-actions">
                                        <button
                                            className="btn-zara-primary"
                                            onClick={() => setIsVisualizerOpen(true)}
                                        >
                                            TRY ON MY WALL
                                        </button>
                                        <button
                                            className="btn-zara-outline"
                                            onClick={() => setIsEnquiryOpen(true)}
                                        >
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
                                <h2 className="related-title">SIMILAR WALLPAPERS YOU MAY LIKE</h2>
                                <div className="related-zara-grid">
                                    {productList.filter(p => p.slug !== slug).slice(0, 12).map((item) => (
                                        <Link key={item.id} to={`/wallpaper/${item.slug}`} className="related-item">
                                            <div className="related-img-container">
                                                <img
                                                    src={item.images?.[0]?.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                    alt={item.name}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="related-info">
                                                <span className="related-name">{item.name}</span>
                                                <span className="related-price">₹ {item.price || '4,350.00'}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
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
                        <button onClick={() => setIsEnquiryOpen(true)} className="tool-link" style={{ background: 'none', border: 'none', width: '100%', padding: 0, textAlign: 'left' }}>
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
