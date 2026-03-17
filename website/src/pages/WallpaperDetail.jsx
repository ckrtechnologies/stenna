import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWallpaperBySlug, fetchWallpapers, fetchGroups, fetchCategories } from '../services/api';
import RelatedProductCarousel from '../components/RelatedProductCarousel';
import VisualizerModal from '../components/VisualizerModal';
import EnquiryModal from '../components/EnquiryModal';
import FloatingProductBar from '../components/FloatingProductBar';
import GroupList from '../components/GroupList';
import CategoryList from '../components/CategoryList';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeImage, setActiveImage] = useState(0);
    const [productList, setProductList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [timeLapseProduct, setTimeLapseProduct] = useState(null);
    const [isTimeLapsing, setIsTimeLapsing] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const prevSlugRef = useRef(slug);
    const mainContentRef = useRef(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

                // If collection jump, fetch new list
                const gId = data.groups?.[0]?.id;
                const cId = data.categories?.[0]?.id;

                if ((gId || cId) && productList.length === 0) {
                    setListLoading(true);
                    const listData = await fetchWallpapers({
                        groupIds: gId ? [gId] : [],
                        categoryIds: cId ? [cId] : [],
                        activeOnly: 'true'
                    });
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
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (isGalleryOpen) {
                // Swipe Gallery Images
                if (diff > 0) {
                    // Swipe Left -> Next Image
                    setActiveImage(prev => (prev + 1) % wallpaper.images.length);
                } else {
                    // Swipe Right -> Prev Image
                    setActiveImage(prev => (prev - 1 + wallpaper.images.length) % wallpaper.images.length);
                }
                setIsZoomed(false); // Reset zoom when switching images
            } else {
                // Swipe Products
                const currentIndex = productList.findIndex(p => p.slug === slug);
                if (currentIndex === -1) return;

                if (diff > 0) {
                    // Swipe Left -> Next Product
                    const nextIndex = (currentIndex + 1) % productList.length;
                    navigate(`/wallpaper/${productList[nextIndex].slug}`);
                } else {
                    // Swipe Right -> Prev Product
                    const prevIndex = (currentIndex - 1 + productList.length) % productList.length;
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
                {/* COLUMN 1: FILTER TRIGGER (CATALOG NAV) */}
                <div className="col-filter-trigger desktop-only" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="zara-breadcrumb" style={{ fontSize: '0.6rem', marginBottom: '0.5rem' }}>
                        <Link to="/">HOME</Link> / <Link to="/catalog">CATALOG</Link> / <span>{wallpaper?.name}</span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <GroupList groups={groups} selectedGroupIds={selectedGroupIds} onToggleGroup={handleToggleGroup} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <CategoryList categories={categories} selectedCategoryIds={selectedCategoryIds} onToggleCategory={handleToggleCategory} />
                    </div>
                </div>

                {/* COLUMN 2: MAIN DETAIL CONTENT */}
                <div ref={mainContentRef} className="col-main-content" style={{ paddingTop: 0, marginTop: 0 }}>
                    <div
                        className="detail-page"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        style={{ touchAction: 'pan-y', paddingTop: 0, marginTop: 0 }}
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
                                        <div className="gallery-main" style={{ overflow: 'hidden' }}>
                                            <motion.img
                                                key={activeImage}
                                                src={wallpaper.images?.[activeImage]?.image_url}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: isZoomed ? (isMobile ? 3 : 2.5) : 1,
                                                    cursor: isZoomed ? 'grab' : 'zoom-in',
                                                    x: isZoomed ? undefined : 0,
                                                    y: isZoomed ? undefined : 0
                                                }}
                                                drag={isZoomed}
                                                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                                                onClick={() => !isZoomed && setIsZoomed(true)}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                style={{
                                                    objectFit: 'contain',
                                                    maxHeight: '90vh',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
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
                                            <div className="zoom-indicator">
                                                {isZoomed ? 'DRAG TO MOVE' : 'TAP TO ZOOM'}
                                            </div>
                                        </div>
                                        <div className="gallery-sidebar">


                                            {wallpaper.images?.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`gallery-thumb ${activeImage === idx ? 'active' : ''}`}
                                                    onClick={async () => {
                                                        if (idx === activeImage) return;
                                                        // Internal Time-Lapse for Image Selection
                                                        setIsTimeLapsing(true);
                                                        const direction = idx > activeImage ? 1 : -1;
                                                        for (let i = activeImage + direction; direction > 0 ? i < idx : i > idx; i += direction) {
                                                            setTimeLapseProduct({ ...wallpaper, images: [wallpaper.images[i]] });
                                                            await new Promise(r => setTimeout(r, 20));
                                                        }
                                                        setIsTimeLapsing(false);
                                                        setTimeLapseProduct(null);
                                                        setActiveImage(idx);
                                                    }}
                                                >
                                                    <img src={img.image_url} alt="Gallery Thumb" />
                                                </div>
                                            ))}
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
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
                                    <div className="zara-breadcrumb" style={{ marginBottom: '0.5rem' }}>
                                        <Link to="/catalog">Catalog</Link> / <span>{wallpaper.name} - {wallpaper.design_code} </span>
                                    </div>

                                    <h1 className="zara-detail-title">{wallpaper.name}</h1>
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
                                                Fit Guide
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
                                        {wallpaper.choose_if && (
                                            <div className="story-section" style={isMobile && activeTab === 'fit' ? { borderTop: 'none', paddingTop: 0 } : {}}>
                                                <h4 className="story-label">Choose this design if…</h4>
                                                <ul className="story-list fit-well">
                                                    {wallpaper.choose_if.split('|').filter(v => v.trim()).map((v, i) => (
                                                        <li key={i}>
                                                            <CheckCircle size={16} className="fit-icon success" />
                                                            <span>{v.trim()}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Avoid if */}
                                        {wallpaper.avoid_if && (
                                            <div className="story-section">
                                                <h4 className="story-label">Avoid if…</h4>
                                                <ul className="story-list fit-bad">
                                                    {wallpaper.avoid_if.split('|').filter(v => v.trim()).map((v, i) => (
                                                        <li key={i}>
                                                            <XCircle size={16} className="fit-icon error" />
                                                            <span>{v.trim()}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Ideal For */}
                                        {wallpaper.ideal_for && (
                                            <div className="story-section">
                                                <h4 className="story-label">Ideal For</h4>
                                                <div className="story-chips">
                                                    {wallpaper.ideal_for.split(/[•.,|]/).filter(v => v.trim()).map((v, i) => (
                                                        <span key={i} className="story-chip ideal">
                                                            {getIconForItem(v)}
                                                            {v.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* RELATED PRODUCTS SECTION */}
                        {!loading && productList.length > 0 && (
                            <section className="related-wallpapers-section">
                                <h2 className="related-title">YOU MAY BE INTERESTED IN</h2>
                                <div className="related-zara-grid">
                                    {productList.slice(0, 12).map((item) => (
                                        <Link key={item.id} to={`/wallpaper/${item.slug}`} className="related-item">
                                            <div className="related-img-container">
                                                <img src={item.images?.[0]?.image_url} alt={item.name} />
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

                        {/* <FloatingProductBar
                            currentSlug={slug}
                            groupId={firstGroupId}
                            categoryId={firstCategoryId}
                            products={productList}
                            loading={listLoading}
                        /> */}
                    </div>
                </div>

                {/* COLUMN 3: TOOLS PANEL */}
                <div className="col-tools-panel desktop-only">
                    {/* Search Section */}
                    <div className="tool-section">
                        {/* <h3>SEARCH</h3> */}
                        <div style={{ position: 'relative', borderBottom: '1px solid #000' }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleMobileSearch}
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

                    {/* Discovery Section */}
                    <div className="tool-section">
                        <h3>DISCOVERY</h3>
                        <Link to="/try-it-on" className="tool-link">
                            <Layout size={16} /> TRY IT ON YOUR WALL
                        </Link>
                        <Link to="/ai-recommendations" className="tool-link">
                            <Sparkles size={16} /> AI RECOMMENDATIONS
                        </Link>
                    </div>

                    {/* Actions Section */}
                    <div className="tool-section">
                        <h3>ACTIONS</h3>
                        <button onClick={() => setIsEnquiryOpen(true)} className="tool-link" style={{ background: 'none', border: 'none', width: '100%', padding: 0 }}>
                            ENQUIRE NOW
                        </button>
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

export default WallpaperDetail;
