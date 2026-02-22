import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVisualizationHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const TryItOn = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await fetchVisualizationHistory();
                setHistory(data);
            } catch (err) {
                console.error("Error fetching visualizer history:", err);
                setError("Failed to load your past designs.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [user]);

    if (loading) return <div className="loading">Loading your design history...</div>;

    if (!user) {
        return (
            <div className="try-it-on-page">
                <header className="page-header" style={{ marginBottom: '2rem' }}>
                    <h2>My Room Tries</h2>
                    <p>Login to see your saved AI room transformations.</p>
                </header>
                <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <Link to="/login" className="btn-glowing" style={{ textDecoration: 'none', padding: '1rem 2rem' }}>Login to View History</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="try-it-on-page">
            {/* 1. Hero / Infographic Section */}
            <header className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>AI Room Visualizer</h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>See Stenna designs on your own walls in seconds.</p>
            </header>

            <div className="info-section card" style={{ padding: '3rem', marginBottom: '4rem', background: 'linear-gradient(145deg, #ffffff, #f9f9f9)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-color)' }}>How it Works</h3>
                <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                    <div className="step" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🖼️</div>
                        <h4 style={{ marginBottom: '0.5rem' }}>1. Pick Design</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Find a wallpaper you love in our curated catalog.</p>
                    </div>
                    <div className="step" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📸</div>
                        <h4 style={{ marginBottom: '0.5rem' }}>2. Upload Room</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Take a photo of your room and upload it via the 'Try on Wall' button.</p>
                    </div>
                    <div className="step" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                        <h4 style={{ marginBottom: '0.5rem' }}>3. AI Transformation</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Our AI perfectly applies the design to your walls with realistic lighting.</p>
                    </div>
                </div>
            </div>

            {/* 2. Primary CTA Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <Link to="/catalog" className="btn-glowing" style={{
                    textDecoration: 'none',
                    padding: '1.25rem 3rem',
                    fontSize: '1.2rem',
                    display: 'inline-block'
                }}>
                    Explore Catalog & Try Now
                </Link>
            </div>

            {/* 3. History Section */}
            <div className="history-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Recent Transformations</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{history.length} saved tries</span>
                </div>

                {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                {history.length > 0 ? (
                    <div className="grid grid-cols-3">
                        {history.map((item) => (
                            <div key={item.id} className="card" style={{ overflow: 'hidden', transition: 'transform 0.3s ease' }}>
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <img
                                        src={item.generated_image_url}
                                        alt="AI Visualization"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        right: '10px',
                                        background: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem'
                                    }}>
                                        AI Generated
                                    </div>
                                </div>

                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        Applied: {item.wallpapers?.name || 'Stenna Design'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <Link
                                            to={`/wallpaper/${item.wallpapers?.slug}`}
                                            className="nav-item"
                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', color: 'var(--primary-color)' }}
                                        >
                                            View Product →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>No designs saved yet. Be the first to try!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TryItOn;
