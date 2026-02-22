import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import VisualizerModal from './VisualizerModal';

const WallpaperList = ({ wallpapers, isAlternating = false }) => {
    const [selectedWallpaper, setSelectedWallpaper] = useState(null);

    if (wallpapers.length === 0) {
        return <div className="no-results">No wallpapers found for this selection.</div>;
    }

    if (isAlternating) {
        return (
            <div className="alternating-list">
                <VisualizerModal
                    isOpen={!!selectedWallpaper}
                    onClose={() => setSelectedWallpaper(null)}
                    wallpaper={selectedWallpaper}
                />
                {wallpapers.map((wallpaper, index) => (
                    <div
                        key={wallpaper.id}
                        className="alternating-item fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="alt-image-box">
                            <Link to={`/wallpaper/${wallpaper.slug}`}>
                                <img
                                    src={wallpaper.images?.[0]?.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                    alt={wallpaper.name}
                                    loading="lazy"
                                />
                            </Link>
                        </div>
                        <div className="alt-text-box">
                            <span className="zara-label" style={{ fontSize: '0.6rem', marginBottom: '0.5rem', display: 'block' }}>
                                ITEM {index + 1}
                            </span>
                            <h4>{wallpaper.name}</h4>
                            <p>{wallpaper.description || "Discover the essence of architectural purity with our hand-curated collection of premium wall coverings."}</p>
                            <Link to={`/wallpaper/${wallpaper.slug}`} className="btn-zara-link" style={{ marginTop: '2rem' }}>
                                VIEW DETAILS
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="zara-grid">
            <VisualizerModal
                isOpen={!!selectedWallpaper}
                onClose={() => setSelectedWallpaper(null)}
                wallpaper={selectedWallpaper}
            />
            {wallpapers.map((wallpaper, index) => (
                <div
                    key={wallpaper.id}
                    className="card zara-product-card fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <Link to={`/wallpaper/${wallpaper.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="image-container zara-image-aspect">
                            <img
                                src={wallpaper.images?.[0]?.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                alt={wallpaper.name}
                                loading="lazy"
                            />
                        </div>
                        <div className="card-content zara-product-info" style={{ padding: '0.5rem 0' }}>
                            <h4 style={{ fontSize: '0.65rem', fontWeight: '400', letterSpacing: '0.05em' }}>{wallpaper.name}</h4>
                            <p className="slug" style={{ fontSize: '0.6rem', color: '#999', marginTop: '2px' }}>{wallpaper.slug}</p>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );

};

export default WallpaperList;
