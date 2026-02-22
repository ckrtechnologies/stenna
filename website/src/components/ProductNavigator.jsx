import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'framer-motion';
import { X, ChevronRight, Maximize2, MoveRight } from 'lucide-react';
import '../styles/ProductNavigator.css';

const ProductNavigator = ({ products }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [direction, setDirection] = useState(0);

    // Tracking for smooth scroll animation
    const trackRef = useRef(null);
    const scrollX = useSpring(0, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const cursorY = useSpring(0, { stiffness: 100, damping: 30 });
    const progressX = useSpring(0, { stiffness: 100, damping: 30 });

    const totalProducts = products.length;

    // Sync spring values when activeIndex changes
    useEffect(() => {
        const targetX = -activeIndex * 60; // 60vw is roughly the step
        const targetY = (activeIndex * (100 / (totalProducts - 1 || 1))) || 0;
        const targetProgress = (activeIndex / (totalProducts - 1 || 1)) * 300;

        // Dynamic duration based on distance
        const distance = Math.abs(activeIndex - (indexRef.current || 0));
        const baseStiffness = 100;
        const adjStiffness = Math.max(20, baseStiffness - (distance * 10));

        scrollX.set(targetX);
        cursorY.set(activeIndex * 80 + 40); // 80px is item height
        progressX.set(targetProgress);

        indexRef.current = activeIndex;
    }, [activeIndex, totalProducts, scrollX, cursorY, progressX]);

    const indexRef = useRef(activeIndex);

    const handleProductSelect = (index) => {
        if (index === activeIndex) return;
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                handleProductSelect(Math.min(activeIndex + 1, totalProducts - 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                handleProductSelect(Math.max(activeIndex - 1, 0));
            } else if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, totalProducts, isModalOpen]);

    const activeProduct = products[activeIndex] || {};

    return (
        <div className="product-navigator-page">
            {/* Left Vertical Speed Nav */}
            <div className="vertical-speed-nav">
                <motion.div
                    className="vertical-cursor"
                    style={{ y: cursorY, top: '-20px' }}
                />
                {products.map((p, i) => (
                    <div
                        key={p.id}
                        className={`speed-nav-item ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => handleProductSelect(i)}
                    >
                        <span className="speed-nav-label">0{i + 1} // {p.name.substring(0, 10)}</span>
                    </div>
                ))}
            </div>

            {/* Main Product Display Area */}
            <div className="product-slider-container">
                <motion.div
                    className="product-track"
                    style={{ x: scrollX.to(v => `${v}vw`) }}
                >
                    {products.map((product, i) => (
                        <div key={product.id} className="product-focus-card">
                            <AnimatePresence mode="wait">
                                {i === activeIndex && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="product-details-content"
                                    >
                                        <div
                                            className="product-image-box"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            <img src={product.image_url} alt={product.name} />
                                        </div>
                                        <div className="product-meta-tags">
                                            <span className="tag">{product.category_name || 'COLLECTION'}</span>
                                            <span className="tag">{product.material || 'METALLIC'}</span>
                                        </div>
                                        <h2>{product.name}</h2>
                                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'left' }}>
                                                <p>REF. 2026 / {product.slug?.substring(0, 8).toUpperCase()}</p>
                                                <p style={{ marginTop: '0.5rem' }}>STITCH: HAND-WOVEN ARCHIVE</p>
                                            </div>
                                            <button className="btn-zara-solid" style={{ transform: 'scale(0.8)' }}>
                                                View Piece <MoveRight size={14} style={{ marginLeft: '10px' }} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom Scroll Controller */}
            <div className="horizontal-controller">
                <div style={{ marginRight: '3rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>NAVIGATE SELECTION</span>
                    <h4 style={{ fontSize: '1rem', letterSpacing: '2px', marginTop: '5px' }}>{activeIndex + 1} / {totalProducts}</h4>
                </div>
                <div
                    className="scroll-control-track"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        const targetIndex = Math.round(percent * (totalProducts - 1));
                        handleProductSelect(targetIndex);
                    }}
                >
                    <motion.div
                        className="scroll-progress-fill"
                        style={{ width: progressX }}
                    />
                    <motion.div
                        className="horizontal-cursor"
                        style={{ x: progressX }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 300 }}
                        onDrag={(e, info) => {
                            const targetIndex = Math.round((info.point.x - e.target.offsetParent.getBoundingClientRect().left) / 300 * (totalProducts - 1));
                            const safeIndex = Math.max(0, Math.min(totalProducts - 1, targetIndex));
                            if (safeIndex !== activeIndex) handleProductSelect(safeIndex);
                        }}
                    />
                </div>
            </div>

            {/* Fullscreen Zoom Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fullscreen-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="modal-inner"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <img src={activeProduct.image_url} alt={activeProduct.name} className="modal-image" />
                            <button className="modal-close-btn">
                                <X size={32} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductNavigator;
