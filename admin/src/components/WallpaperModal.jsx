import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
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
        story: '',
        customer_fit: [], // Array of strings
        mood_tags: [], // Array of strings
        ideal_for: [], // Array of strings
        whatsapp_line: ''
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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(file => {
                const data = new FormData();
                data.append('image', file);
                return api.post('/upload/wallpaper', data);
            });

            const results = await Promise.all(uploadPromises);
            const newImages = results.map(res => ({
                url: res.data.url,
                public_id: res.data.public_id
            }));

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }));
        } catch (error) {
            alert('Failed to upload one or more images');
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(file => {
                const data = new FormData();
                data.append('image', file); // API uses 'image' key but Cloudinary auto-detects
                return api.post('/upload/wallpaper', data);
            });

            const results = await Promise.all(uploadPromises);
            const newVideos = results.map(res => ({
                url: res.data.url,
                public_id: res.data.public_id
            }));

            setFormData(prev => ({
                ...prev,
                videos: [...prev.videos, ...newVideos]
            }));
        } catch (error) {
            alert('Failed to upload one or more videos');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeVideo = (index) => {
        setFormData(prev => ({
            ...prev,
            videos: prev.videos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            images: formData.images.map(img => img.url), // Send only URLs to the backend
            videos: formData.videos.map(vid => vid.url), // Send only URLs to the backend
            price: formData.price ? parseFloat(formData.price) : null,
            quantity: formData.quantity ? parseInt(formData.quantity) : 0,
            roll_width: formData.roll_width ? parseFloat(formData.roll_width) : null,
            roll_height: formData.roll_height ? parseFloat(formData.roll_height) : null,
            // Ensure lists are sent as arrays
            customer_fit: Array.isArray(formData.customer_fit) ? formData.customer_fit : [],
            mood_tags: Array.isArray(formData.mood_tags) ? formData.mood_tags : [],
            ideal_for: Array.isArray(formData.ideal_for) ? formData.ideal_for : []
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
                            <h3 className="section-title">Gallery</h3>
                            <div className="gallery-manager">
                                <div className="gallery-grid">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="gallery-item">
                                            <img src={img.url} alt={`Gallery ${idx}`} />
                                            <button type="button" className="remove-img" onClick={() => removeImage(idx)}>
                                                <Trash2 size={14} />
                                            </button>
                                            {idx === 0 && <span className="main-tag">Main</span>}
                                        </div>
                                    ))}
                                    <label className="add-image-card">
                                        {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                        <span>{uploading ? 'Uploading...' : 'Add Image'}</span>
                                        <input type="file" multiple onChange={handleImageUpload} hidden accept="image/*" disabled={uploading} />
                                    </label>
                                </div>
                            </div>

                            <h3 className="section-title mt-4">Videos</h3>
                            <div className="gallery-manager">
                                <div className="gallery-grid">
                                    {formData.videos.map((vid, idx) => (
                                        <div key={idx} className="gallery-item">
                                            <video src={vid.url} className="w-full h-full object-cover" />
                                            <button type="button" className="remove-img" onClick={() => removeVideo(idx)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="add-image-card">
                                        {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                        <span>{uploading ? 'Uploading...' : 'Add Video'}</span>
                                        <input type="file" multiple onChange={handleVideoUpload} hidden accept="video/*" disabled={uploading} />
                                    </label>
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
                        <h3 className="section-title">Story-Driven Information (Premium)</h3>
                        <div className="form-grid">
                            <div className="field full">
                                <label>Tagline (e.g. For homes that want warmth...)</label>
                                <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="The punchy one-liner header" />
                            </div>
                            <div className="field full">
                                <label>The Story (Narrative description)</label>
                                <textarea name="story" value={formData.story} onChange={handleChange} rows="4" placeholder="Describe the inspiration, soul and feel of this wallpaper..." />
                            </div>
                            <div className="field full">
                                <label>Why Customers Love It (Indian Home Fit) - One per line</label>
                                <textarea
                                    name="customer_fit"
                                    value={Array.isArray(formData.customer_fit) ? formData.customer_fit.join('\n') : ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customer_fit: e.target.value.split('\n').filter(Boolean) }))}
                                    rows="3"
                                    placeholder="Works beautifully with wooden furniture&#10;Enhances warm yellow lighting..."
                                />
                            </div>
                            <div className="field half">
                                <label>Mood Tags (Comma separated)</label>
                                <input
                                    name="mood_tags"
                                    value={Array.isArray(formData.mood_tags) ? formData.mood_tags.join(', ') : ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mood_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                                    placeholder="Warm, Earthy, Timeless..."
                                />
                            </div>
                            <div className="field half">
                                <label>Ideal For (Comma separated)</label>
                                <input
                                    name="ideal_for"
                                    value={Array.isArray(formData.ideal_for) ? formData.ideal_for.join(', ') : ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ideal_for: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                                    placeholder="Master Bedroom, Living Room..."
                                />
                            </div>
                            <div className="field full">
                                <label>10-Second Decision Line (WhatsApp Punchline)</label>
                                <textarea name="whatsapp_line" value={formData.whatsapp_line} onChange={handleChange} rows="2" placeholder="This design is for people who want..." />
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
                .remove-img { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(239, 68, 68, 0.9); border: none; color: white; padding: 0.4rem; border-radius: 0.5rem; cursor: pointer; opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; }
                .gallery-item:hover .remove-img { opacity: 1; }
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
            `}</style>

        </div>
    );
};

export default WallpaperModal;
