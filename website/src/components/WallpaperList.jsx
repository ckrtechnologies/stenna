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
            {(() => {
                const processed = [];
                let i = 0;
                while (i < wallpapers.length) {
                    const current = wallpapers[i];
                    // Base pattern: Item at index 0, 5, 8 etc. wants to be full
                    const wantsFull = i % 6 === 0;

                    if (wantsFull || i === wallpapers.length - 1) {
                        // If it wants to be full OR it's the absolute last item, it takes full width
                        processed.push({ ...current, isFull: true, index: i });
                        i++;
                    } else {
                        // It wants to be half. Check if there's a next item that can pair with it.
                        // If the next item also "wants" to be full, then THIS item must be full to avoid a gap.
                        const nextWantsFull = (i + 1) % 6 === 0;
                        if (nextWantsFull) {
                            processed.push({ ...current, isFull: true, index: i });
                            i++;
                        } else {
                            // Pair them
                            processed.push({ ...current, isFull: false, index: i });
                            if (i + 1 < wallpapers.length) {
                                processed.push({ ...wallpapers[i + 1], isFull: false, index: i + 1 });
                                i += 2;
                            } else {
                                // Should not happen with logic above, but for safety:
                                i++;
                            }
                        }
                    }
                }

                return processed.map((wallpaper) => (
                    <div
                        key={wallpaper.id}
                        className={`card zara-product-card fade-in-up ${wallpaper.isFull ? 'editorial-span-2' : ''}`}
                        style={{ animationDelay: `${wallpaper.index * 0.1}s` }}
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
                            </div>
                        </Link>
                    </div>
                ));
            })()}
        </div>
    );

};

export default WallpaperList;
