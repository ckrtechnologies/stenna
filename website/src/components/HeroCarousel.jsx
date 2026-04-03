import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const heroSlides = [
    {
        url: '/hero/natures_whisper.png',
        title: 'Nature\'s Whisper',
        subtitle: 'Organic textures for serene living'
    },
    {
        url: '/hero/midnight_bloom.png',
        title: 'Midnight Bloom',
        subtitle: 'Bohemian elegance for your sanctuary'
    },
    {
        url: '/hero/timeless_grace.png',
        title: 'Timeless Grace',
        subtitle: 'Classic patterns in modern hues'
    },
    {
        url: '/hero/modern_edge.png',
        title: 'Modern Edge',
        subtitle: 'Bolder strokes for the contemporary home'
    },
    {
        url: '/hero/pure_minimal.png',
        title: 'Pure Minimal',
        subtitle: 'Subtle depths for peaceful spaces'
    },
];

const HeroCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
        }, 3000); // 3 seconds interval
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="hero-carousel-container">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="hero-carousel-slide"
                    style={{ backgroundImage: `url(${heroSlides[currentIndex].url})` }}
                >
                    <div className="hero-overlay"></div>
                </motion.div>
            </AnimatePresence>

            <div className="hero-content-GB">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`content-${currentIndex}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-script-text text-heading">
                            {heroSlides[currentIndex].title}
                        </h1>
                        <p className="hero-subtitle-text text-body" style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 'var(--fs-caption)', opacity: 0.8 }}>
                            {heroSlides[currentIndex].subtitle}
                        </p>
                        <div style={{ marginTop: '2rem' }}>
                            <Link to="/catalog" className="btn-zara-solid hero-cta-btn text-action">
                                View All Collections
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Indicators */}
            <div className="hero-pagination">
                {heroSlides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`pagination-dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroCarousel;
