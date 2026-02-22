import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWallpapers } from '../services/api';
import '../styles/Home.css';

const FloatingProductBar = ({ currentSlug, products = [], loading = false }) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const [scrollOffset, setScrollOffset] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [startOffset, setStartOffset] = useState(0);

    // Cinematic Sync - Slide to current active product
    useEffect(() => {
        if (products.length > 0 && currentSlug && !isSwiping) {
            const index = products.findIndex(p => p.slug === currentSlug);
            if (index !== -1) {
                setSelectedIndex(index);

                // Calculate centering offset within the new 25% width container
                const itemWidth = 55; // 45px + 10px gap
                const containerWidth = window.innerWidth * 0.25;
                const offset = -index * itemWidth + (containerWidth / 2) - 22.5; // 22.5 is half of 45
                setScrollOffset(offset);
            }
        }
    }, [currentSlug, products, isSwiping]);

    const handleProductClick = (index, slug) => {
        if (slug === currentSlug || isSwiping) return;

        // Optimistic update
        setSelectedIndex(index);
        const itemWidth = 55;
        const containerWidth = window.innerWidth * 0.25;
        const offset = -index * itemWidth + (containerWidth / 2) - 22.5;
        setScrollOffset(offset);

        // Immediate navigation
        navigate(`/wallpaper/${slug}`);
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        setStartOffset(scrollOffset);
        setIsSwiping(false);
    };

    const handleTouchMove = (e) => {
        const currentTouch = e.targetTouches[0].clientX;
        const diff = currentTouch - touchStart;
        if (Math.abs(diff) > 5) {
            setIsSwiping(true);
            setScrollOffset(startOffset + diff);
        }
    };

    const handleTouchEnd = () => {
        // Delay resetting isSwiping to prevent accidental clicks
        setTimeout(() => setIsSwiping(false), 50);
    };

    if (loading || products.length === 0) return null;

    return (
        <div className="floating-product-bar-v3">
            <div
                className="carousel-wrapper-v3"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="carousel-track-v3"
                    style={{
                        transform: `translateX(${scrollOffset}px)`,
                        transition: isSwiping ? 'none' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className={`carousel-item-v3 ${selectedIndex === index ? 'active' : ''}`}
                            onClick={() => handleProductClick(index, product.slug)}
                        >
                            <img
                                src={product.images?.[0]?.image_url || 'https://via.placeholder.com/80x120'}
                                alt={product.name}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FloatingProductBar;
