import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, Plus, Download, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const WallpaperModal = ({ isOpen, onClose, onSave, wallpaper, categories, groups = [] }) => {
    const initialState = {
        name: '',
        slug: '',
        design_code: '',
        description: '',
        price: '',
        roll_width: '',
        roll_height: '',
        material: '',
        finish: '',
        washability: '',
        durability: '',
        brand: '',
        country: '',
        is_active: true,
        quantity: 0,
        images: [], // Array of URLs
        videos: [], // Array of URLs
        category_ids: [], // Array of UUIDs
        group_ids: [], // Array of UUIDs
        tagline: '',
        vibe: '',
        choose_if: '',
        avoid_if: '',
        ideal_for: '',
        swatch: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (wallpaper && isOpen) {
            setFormData({
                ...initialState,
                ...wallpaper,
                images: wallpaper.images?.map(img => ({ url: img.image_url })) || [],
                videos: wallpaper.videos?.map(vid => ({ url: vid.video_url })) || [],
                category_ids: wallpaper.categories?.map(c => c.id) || [],
                group_ids: wallpaper.groups?.map(g => g.id) || []
            });
        } else if (isOpen) {
            setFormData(initialState);
        }
    }, [wallpaper, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-generate slug for new wallpapers
            if (name === 'name' && !wallpaper) {
                newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }
            return newData;
        });
    };

    const handleCategoryToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            category_ids: prev.category_ids.includes(id)
                ? prev.category_ids.filter(catId => catId !== id)
                : [...prev.category_ids, id]
        }));
    };

    const handleGroupToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            group_ids: prev.group_ids.includes(id)
                ? prev.group_ids.filter(groupId => groupId !== id)
                : [...prev.group_ids, id]
        }));
    };

    const handleSpecificImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = new FormData();
            data.append('image', file);
            const res = await api.post('/upload/wallpaper', data);
            
            setFormData(prev => {
                const newImages = [...prev.images];
                newImages[index] = { url: res.data.url, public_id: res.data.public_id };
                return { ...prev, images: newImages };
            });
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSwatchUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = new FormData();
            data.append('image', file);
            const res = await api.post('/upload/wallpaper', data);
            
            setFormData(prev => ({
                ...prev,
                swatch: res.data.url
            }));
        } catch (error) {
            alert('Failed to upload swatch');
        } finally {
            setUploading(false);
        }
    };

    const handleSpecificVideoUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = new FormData();
            data.append('image', file);
            const res = await api.post('/upload/wallpaper', data);
            
            setFormData(prev => {
                const newVideos = [...prev.videos];
                newVideos[index] = { url: res.data.url, public_id: res.data.public_id };
                return { ...prev, videos: newVideos };
            });
        } catch (error) {
            alert('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages[index] = null;
            return { ...prev, images: newImages };
        });
    };

    const removeVideo = (index) => {
        setFormData(prev => {
            const newVideos = [...prev.videos];
            newVideos[index] = null;
            return { ...prev, videos: newVideos };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            images: formData.images.filter(img => img && img.url).map(img => img.url),
            videos: formData.videos.filter(vid => vid && vid.url).map(vid => vid.url),
            price: formData.price ? parseFloat(formData.price) : null,
            quantity: formData.quantity ? parseInt(formData.quantity) : 0,
            roll_width: formData.roll_width ? parseFloat(formData.roll_width) : null,
            roll_height: formData.roll_height ? parseFloat(formData.roll_height) : null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{wallpaper ? 'Edit Wallpaper' : 'Add New Wallpaper'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body-grid">
                        {/* Left Column: Basic Info & Specs */}
                        <div className="form-section">
                            <h3 className="section-title">Product Details</h3>
                            <div className="form-grid">
                                <div className="field full">
                                    <label>Wallpaper Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Royal Silk Texture" />
                                </div>
                                <div className="field">
                                    <label>Design Code</label>
                                    <input name="design_code" value={formData.design_code} onChange={handleChange} placeholder="e.g. RS-102" />
                                </div>
                                <div className="field">
                                    <label>Price ($)</label>
                                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" />
                                </div>
                                <div className="field">
                                    <label>Roll Width (cm)</label>
                                    <input name="roll_width" type="number" value={formData.roll_width} onChange={handleChange} placeholder="53" />
                                </div>
                                <div className="field">
                                    <label>Roll Height (m)</label>
                                    <input name="roll_height" type="number" value={formData.roll_height} onChange={handleChange} placeholder="10" />
                                </div>
                                <div className="field">
                                    <label>Stock Quantity</label>
                                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="0" />
                                </div>
                            </div>

                            <h3 className="section-title mt-4">Technical Specifications</h3>
                            <div className="form-grid">
                                <div className="field">
                                    <label>Material</label>
                                    <input name="material" value={formData.material} onChange={handleChange} placeholder="Non-woven" />
                                </div>
                                <div className="field">
                                    <label>Finish</label>
                                    <input name="finish" value={formData.finish} onChange={handleChange} placeholder="Matte" />
                                </div>
                                <div className="field">
                                    <label>Washability</label>
                                    <input name="washability" value={formData.washability} onChange={handleChange} placeholder="Washable" />
                                </div>
                                <div className="field">
                                    <label>Durability</label>
                                    <input name="durability" value={formData.durability} onChange={handleChange} placeholder="High" />
                                </div>
                                <div className="field">
                                    <label>Brand</label>
                                    <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Luxe Walls" />
                                </div>
                                <div className="field">
                                    <label>Country</label>
                                    <input name="country" value={formData.country} onChange={handleChange} placeholder="Italy" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Images & Categories */}
                        <div className="form-section">
                            <h3 className="section-title">Color Swatch</h3>
                            <div className="gallery-manager mb-6">
                                <div className="gallery-slot-item" style={{ maxWidth: '120px' }}>
                                    <div className="slot-card">
                                        {formData.swatch ? (
                                            <>
                                                <img src={formData.swatch} alt="Swatch" />
                                                <div className="slot-actions">
                                                    <a href={formData.swatch} target="_blank" rel="noopener noreferrer" className="action-btn" title="Download">
                                                        <Download size={14} />
                                                    </a>
                                                    <label className="action-btn" title="Replace">
                                                        <RefreshCw size={14} />
                                                        <input type="file" onChange={handleSwatchUpload} hidden accept="image/*" disabled={uploading} />
                                                    </label>
                                                    <button type="button" className="action-btn delete" onClick={() => setFormData(prev => ({ ...prev, swatch: '' }))}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="add-slot-card">
                                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={20} />}
                                                <input 
                                                    type="file" 
                                                    onChange={handleSwatchUpload} 
                                                    hidden 
                                                    accept="image/*" 
                                                    disabled={uploading} 
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="section-title">Product Gallery (6 Images)</h3>
                            <div className="gallery-manager">
                                <div className="gallery-slots-grid">
                                    {[
                                        'Hand Image',
                                        'Medium Short',
                                        'Far Short',
                                        'Warm Family',
                                        'Modal with Book',
                                        'Rustic'
                                    ].map((label, idx) => {
                                        const img = formData.images[idx];
                                        return (
                                            <div key={idx} className="gallery-slot-item">
                                                <label className="slot-label">{idx + 1}. {label}</label>
                                                <div className="slot-card">
                                                    {img ? (
                                                        <>
                                                            <img src={img.url} alt={label} />
                                                            <div className="slot-actions">
                                                                <a href={img.url} target="_blank" rel="noopener noreferrer" className="action-btn" title="Download">
                                                                    <Download size={14} />
                                                                </a>
                                                                <label className="action-btn" title="Replace">
                                                                    <RefreshCw size={14} />
                                                                    <input type="file" onChange={(e) => handleSpecificImageUpload(e, idx)} hidden accept="image/*" disabled={uploading} />
                                                                </label>
                                                                <button type="button" className="action-btn delete" onClick={() => removeImage(idx)}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="add-slot-card">
                                                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={20} />}
                                                            <input 
                                                                type="file" 
                                                                onChange={(e) => handleSpecificImageUpload(e, idx)} 
                                                                hidden 
                                                                accept="image/*" 
                                                                disabled={uploading} 
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <h3 className="section-title mt-4">Product Video</h3>
                            <div className="gallery-manager">
                                <div className="gallery-slot-item">
                                    <label className="slot-label">1. Sponge Wash Video</label>
                                    <div className="slot-card video-slot">
                                        {formData.videos[0] ? (
                                            <>
                                                <video src={formData.videos[0].url} className="w-full h-full object-cover" />
                                                <div className="slot-actions">
                                                    <a href={formData.videos[0].url} target="_blank" rel="noopener noreferrer" className="action-btn" title="Download">
                                                        <Download size={14} />
                                                    </a>
                                                    <label className="action-btn" title="Replace">
                                                        <RefreshCw size={14} />
                                                        <input type="file" onChange={(e) => handleSpecificVideoUpload(e, 0)} hidden accept="video/*" disabled={uploading} />
                                                    </label>
                                                    <button type="button" className="action-btn delete" onClick={() => removeVideo(0)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="add-slot-card">
                                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={20} />}
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => handleSpecificVideoUpload(e, 0)} 
                                                    hidden 
                                                    accept="video/*" 
                                                    disabled={uploading} 
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="section-title mt-4">Groups</h3>
                            <div className="category-selector mb-4">
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        type="button"
                                        className={`cat-chip ${formData.group_ids.includes(group.id) ? 'active' : ''}`}
                                        onClick={() => handleGroupToggle(group.id)}
                                    >
                                        {group.name}
                                    </button>
                                ))}
                            </div>

                            <h3 className="section-title mt-4">Categories</h3>
                            <div className="category-selector">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`cat-chip ${formData.category_ids.includes(cat.id) ? 'active' : ''}`}
                                        onClick={() => handleCategoryToggle(cat.id)}
                                    >
                                        {cat.name}
                                        <small>{cat.group?.name}</small>
                                    </button>
                                ))}
                            </div>

                            <div className="field mt-4">
                                <label className="checkbox-field">
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                    <span>Product is Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="field full mt-2">
                        <label>Description (Optional)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Tell more about this wallpaper..." />
                    </div>

                    <div className="form-section full-width mt-4">
                        <h3 className="section-title">Storytelling & Fit Information</h3>
                        <div className="form-grid">
                            <div className="field full">
                                <label>Tagline (e.g. For homes that want warmth...)</label>
                                <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="The punchy one-liner header" />
                            </div>
                            <div className="field full">
                                <label>Vibe (Mood & feel of this wallpaper)</label>
                                <textarea name="vibe" value={formData.vibe} onChange={handleChange} rows="3" placeholder="Describe the vibe, mood and feel of this wallpaper..." />
                            </div>
                            <div className="field full">
                                <label>Choose this design if…</label>
                                <textarea name="choose_if" value={formData.choose_if} onChange={handleChange} rows="3" placeholder="You want a warm, cosy living room with earthy tones..." />
                            </div>
                            <div className="field half">
                                <label>Avoid if…</label>
                                <input name="avoid_if" value={formData.avoid_if} onChange={handleChange} placeholder="Your room has very low ceilings..." />
                            </div>
                            <div className="field half">
                                <label>Ideal For</label>
                                <input name="ideal_for" value={formData.ideal_for} onChange={handleChange} placeholder="Master Bedroom, Living Room..." />
                            </div>
                        </div>
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {wallpaper ? 'Update Product' : 'Create Product'}
                        </button>
                    </footer>
                </form>
            </div>

            <style jsx>{`
                .modal-content.wide { max-width: 1000px; width: 95%; }
                .modal-body-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2.5rem; }
                .section-title { font-size: 0.8125rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-highlight); padding-bottom: 0.5rem; }
                .mt-4 { margin-top: 2rem; }
                
                .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; }
                .gallery-item { aspect-ratio: 1; border-radius: 0.75rem; overflow: hidden; position: relative; border: 1px solid var(--border-color); background: var(--bg-dark); }
                .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
                .slot-actions { 
                    position: absolute; 
                    top: 0.5rem; 
                    right: 0.5rem; 
                    display: flex; 
                    gap: 0.25rem; 
                    opacity: 0; 
                    transition: opacity 0.2s; 
                    z-index: 10;
                }
                .slot-card:hover .slot-actions { opacity: 1; }
                .action-btn { 
                    background: rgba(0, 0, 0, 0.7); 
                    border: none; 
                    color: white; 
                    width: 28px;
                    height: 28px;
                    border-radius: 0.4rem; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    transition: all 0.2s;
                }
                .action-btn:hover { background: var(--primary); transform: scale(1.05); }
                .action-btn.delete:hover { background: #ef4444; }
                .main-tag { position: absolute; bottom: 0; left: 0; right: 0; background: var(--primary); color: white; font-size: 0.65rem; font-weight: 700; text-align: center; padding: 0.25rem; text-transform: uppercase; }
                
                .add-image-card { aspect-ratio: 1; border: 2px dashed var(--border-color); border-radius: 0.75rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .add-image-card:hover { border-color: var(--primary); color: var(--primary); background: rgba(59, 130, 246, 0.05); }
                
                .category-selector { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); 
                    gap: 0.75rem; 
                    max-height: 240px; 
                    overflow-y: auto; 
                    padding: 1.25rem; 
                    background: var(--bg-input); 
                    border-radius: var(--radius-lg); 
                    border: 1px solid var(--border-color); 
                }
                .cat-chip { 
                    padding: 1rem; 
                    border-radius: var(--radius-md); 
                    background: var(--bg-card); 
                    border: 1px solid var(--border-color); 
                    color: var(--text-muted); 
                    font-size: 0.8125rem; 
                    cursor: pointer; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: flex-start; 
                    text-align: left; 
                    transition: all 0.2s; 
                    gap: 0.25rem; 
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .cat-chip small { color: var(--text-dim); font-size: 0.65rem; font-weight: 500; }
                .cat-chip:hover { border-color: var(--primary); background: var(--bg-hover); color: var(--text-main); }
                .cat-chip.active { background: var(--primary); border-color: var(--primary); color: white !important; box-shadow: var(--shadow-glow); }
                .cat-chip.active small { color: rgba(255,255,255,0.8); }
                .mb-4 { margin-bottom: 2rem; }
                
                .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 900px) {
                    .modal-body-grid { grid-template-columns: 1fr; }
                    .modal-content.wide { max-width: 600px; }
                }

                .form-section.full-width {
                    grid-column: span 1;
                }
                
                .field.half {
                    grid-column: span 1;
                }

                @media (min-width: 900px) {
                    .form-section.full-width {
                        grid-column: span 2;
                    }
                    .field.half {
                        grid-column: span 1;
                    }
                }

                .gallery-slots-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }
                .gallery-slot-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .slot-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-dim);
                    white-space: nowrap;
                }
                .slot-card {
                    aspect-ratio: 1;
                    border: 1px solid var(--border-color);
                    border-radius: 0.75rem;
                    overflow: hidden;
                    position: relative;
                    background: var(--bg-dark);
                }
                .slot-card img, .slot-card video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .add-slot-card {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px dashed var(--border-color);
                    border-radius: 0.75rem;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }
                .add-slot-card:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: rgba(59, 130, 246, 0.05);
                }
                .video-slot {
                    max-width: 200px;
                }
            `}</style>

        </div>
    );
};

export default WallpaperModal;
