import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const RelatedProductCarousel = ({ wallpapers, title }) => {
    if (!wallpapers || wallpapers.length === 0) return null;

    return (
        <div className="similar-products">
            <h3 style={{ marginBottom: '1.5rem' }}>{title || 'Similar Products'}</h3>
            <div className="carousel-container hide-scrollbar overflow-x-auto">
                {wallpapers.map(item => (
                    <Link
                        key={item.id}
                        to={`/wallpaper/${item.slug}`}
                        className="carousel-item card"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div className="image-container" style={{ aspectRatio: '3/4' }}>
                            <img
                                src={item.images?.[0]?.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
                                alt={item.name}
                            />
                        </div>
                        <div className="card-content">
                            <h4 style={{ fontSize: '0.9rem' }}>{item.name}</h4>
                            <p className="slug" style={{ fontSize: '0.7rem' }}>{item.slug}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProductCarousel;
