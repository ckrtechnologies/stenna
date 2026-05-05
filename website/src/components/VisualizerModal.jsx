import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateVisualization } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VisualizerModal = ({ isOpen, onClose, wallpaper }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [error, setError] = useState(null);

    // Reset state completely whenever the modal is closed so it's fresh next time
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setResultUrl(null);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('roomImage', selectedFile);
        formData.append('wallpaperId', wallpaper.id);

        try {
            const response = await generateVisualization(formData);
            setResultUrl(response.generatedUrl);
        } catch (err) {
            setError(err.message || 'Failed to generate visualization. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTryAnother = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setError(null);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>&times;</button>

                <h3>Try on my wall</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Applying: <strong>{wallpaper?.name}</strong>
                </p>

                <div className="visualizer-preview">
                    {!user ? (
                        <div className="upload-placeholder" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Experience this in your room</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                Please log in to your Stenna account to use our AI Room Visualizer.
                            </p>
                            <button 
                                className="btn-glowing" 
                                style={{ padding: '0.75rem 2rem' }}
                                onClick={() => navigate('/login', { state: { from: location } })}
                            >
                                Log In to Try
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="upload-placeholder">
                            <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                            <p>Stenna AI is transforming your room...</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>This usually takes 20-40 seconds. Please wait.</p>
                        </div>
                    ) : resultUrl ? (
                        <div style={{ position: 'relative' }}>
                            <img src={resultUrl} alt="Visualized Room" style={{ width: '100%', borderRadius: 'var(--radius)' }} />
                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                AI Generated
                            </div>
                        </div>
                    ) : previewUrl ? (
                        <div style={{ position: 'relative' }}>
                            <img src={previewUrl} alt="Room Preview" style={{ width: '100%', borderRadius: 'var(--radius)' }} />
                            <label className="filter-btn" style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                                Change Photo
                                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                            </label>
                        </div>
                    ) : (
                        <div className="upload-placeholder" style={{ border: '2px dashed #ddd', padding: '3rem 1rem' }}>
                            <p style={{ marginBottom: '1.5rem' }}>Upload a photo of your room to see how this wallpaper looks.</p>
                            <label className="filter-btn active" style={{ cursor: 'pointer', display: 'inline-block', padding: '0.8rem 2rem' }}>
                                Select Room Photo
                                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                            </label>

                            <div className="guidelines-box" style={{ 
                                marginTop: '3rem', 
                                padding: '1.5rem', 
                                background: '#f9f9f9', 
                                borderRadius: '8px',
                                textAlign: 'left',
                                border: '1px solid #eee'
                            }}>
                                <h4 style={{ 
                                    fontSize: '0.65rem', 
                                    letterSpacing: '0.2em', 
                                    textTransform: 'uppercase', 
                                    marginBottom: '1.2rem',
                                    color: '#000',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1rem' }}>💡</span> Tips for best results
                                </h4>
                                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: '1.5' }}>
                                        <strong style={{ display: 'block', color: '#000', marginBottom: '0.2rem', fontSize: '0.7rem', textTransform: 'uppercase' }}>Good Lighting</strong>
                                        Take photos in bright, natural daylight for the most realistic AI textures and shadows.
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: '1.5' }}>
                                        <strong style={{ display: 'block', color: '#000', marginBottom: '0.2rem', fontSize: '0.7rem', textTransform: 'uppercase' }}>Clear View</strong>
                                        Ensure the wall is clearly visible and not heavily obstructed by large furniture or decor.
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: '1.5' }}>
                                        <strong style={{ display: 'block', color: '#000', marginBottom: '0.2rem', fontSize: '0.7rem', textTransform: 'uppercase' }}>Straight Angle</strong>
                                        Capture the wall from a straight-on perspective for perfect wallpaper alignment.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '1rem 0' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    {previewUrl && !resultUrl && !loading && (
                        <button
                            className="btn-glowing"
                            style={{ flex: 1, padding: '0.75rem', minWidth: '150px' }}
                            onClick={handleGenerate}
                        >
                            Apply Wallpaper
                        </button>
                    )}
                    {resultUrl && (
                        <>
                            <button
                                className="filter-btn active"
                                style={{ flex: 1, padding: '0.75rem', minWidth: '150px' }}
                                onClick={handleTryAnother}
                            >
                                Try Another Wall
                            </button>
                            <a
                                href={resultUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-glowing"
                                style={{ flex: 1, padding: '0.75rem', textAlign: 'center', textDecoration: 'none', minWidth: '150px' }}
                            >
                                View Full Size
                            </a>
                        </>
                    )}
                    {!resultUrl && (
                        <button
                            className="filter-btn"
                            style={{ flex: 1, padding: '0.75rem', minWidth: '150px' }}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualizerModal;
