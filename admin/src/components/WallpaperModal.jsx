import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, Plus, Download, RefreshCw, Settings2, Layers, Sparkles, BookOpen } from 'lucide-react';
import api from '../utils/api';

const WallpaperModal = ({ isOpen, onClose, onSave, wallpaper, categories, groups = [], books = [] }) => {
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
        book_ids: [], // Array of UUIDs
        tagline: '',
        vibe: '',
        choose_if: '',
        ideal_for: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('GENERAL');
    const [categorySearch, setCategorySearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');

    useEffect(() => {
        if (wallpaper && isOpen) {
            setFormData({
                ...initialState,
                ...wallpaper,
                // Ensure null strings from DB become empty strings for controlled inputs
                name: wallpaper.name || '',
                slug: wallpaper.slug || '',
                design_code: wallpaper.design_code || '',
                description: wallpaper.description || '',
                price: wallpaper.price || '',
                roll_width: wallpaper.roll_width || '',
                roll_height: wallpaper.roll_height || '',
                material: wallpaper.material || '',
                finish: wallpaper.finish || '',
                washability: wallpaper.washability || '',
                durability: wallpaper.durability || '',
                brand: wallpaper.brand || '',
                country: wallpaper.country || '',
                tagline: wallpaper.tagline || '',
                vibe: wallpaper.vibe || '',
                choose_if: wallpaper.choose_if || '',
                ideal_for: wallpaper.ideal_for || '',
                is_active: wallpaper.is_active ?? true,
                quantity: wallpaper.quantity ?? 0,
                images: wallpaper.images?.map(img => ({ url: img.image_url })) || [],
                videos: wallpaper.videos?.map(vid => ({ url: vid.video_url })) || [],
                category_ids: wallpaper.categories?.map(c => c.id) || [],
                group_ids: wallpaper.groups?.map(g => g.id) || [],
                book_ids: wallpaper.books?.map(b => b.id) || []
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
    
    const handleBookToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            book_ids: prev.book_ids.includes(id)
                ? prev.book_ids.filter(bookId => bookId !== id)
                : [...prev.book_ids, id]
        }));
    };

    const handleSpecificImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!formData.design_code) {
            alert('Please enter a Design Code first to organize the upload on the VPS.');
            return;
        }

        setUploading(true);
        try {
            const data = new FormData();
            data.append('image', file);
            data.append('design_code', formData.design_code);
            // data.append('filename', file.name);
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


    const handleSpecificVideoUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!formData.design_code) {
            alert('Please enter a Design Code first to organize the video on the VPS.');
            return;
        }

        setUploading(true);
        try {
            const data = new FormData();
            data.append('image', file);
            data.append('design_code', formData.design_code);
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
        const { swatch, ...restOfData } = formData;
        onSave({
            ...restOfData,
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
        <div className="admin-modal-overlay bottom-sheet" onClick={onClose}>
            <div className="admin-modal-content admin-modal-sheet" onClick={e => e.stopPropagation()}>
                <header className="admin-modal-header">
                    <h2>{wallpaper ? 'Edit Wallpaper' : 'Add New Wallpaper'}</h2>
                    <button className="admin-close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className="admin-modal-form tabbed-modal">
                    {/* MODAL TABS NAVIGATION */}
                    <div className="admin-modal-tabs">
                        <button type="button" className={`admin-tab-item ${activeTab === 'GENERAL' ? 'active' : ''}`} onClick={() => setActiveTab('GENERAL')}>
                            <Settings2 size={16} /> <span>General</span>
                        </button>
                        <button type="button" className={`admin-tab-item ${activeTab === 'MEDIA' ? 'active' : ''}`} onClick={() => setActiveTab('MEDIA')}>
                            <ImageIcon size={16} /> <span>Media</span>
                        </button>
                        <button type="button" className={`admin-tab-item ${activeTab === 'CLASSIFICATION' ? 'active' : ''}`} onClick={() => setActiveTab('CLASSIFICATION')}>
                            <Layers size={16} /> <span>Classification</span>
                        </button>
                        <button type="button" className={`admin-tab-item ${activeTab === 'STORY' ? 'active' : ''}`} onClick={() => setActiveTab('STORY')}>
                            <Sparkles size={16} /> <span>Storytelling</span>
                        </button>
                        <button type="button" className={`admin-tab-item ${activeTab === 'BOOKS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKS')}>
                            <BookOpen size={16} /> <span>Books</span>
                        </button>
                    </div>

                    <div className="admin-modal-body">
                        {activeTab === 'GENERAL' && (
                            <div className="admin-tab-pane">
                                <section className="admin-form-section">
                                    <h3 className="admin-section-title">Product Details</h3>
                                    <div className="admin-form-grid">
                                        <div className="admin-field full">
                                            <label>Wallpaper Name</label>
                                            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Royal Silk Texture" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Design Code</label>
                                            <input name="design_code" value={formData.design_code} onChange={handleChange} placeholder="e.g. RS-102" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Price (Rs.)</label>
                                            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Roll Width (cm)</label>
                                            <input name="roll_width" type="number" value={formData.roll_width} onChange={handleChange} placeholder="53" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Roll Height (m)</label>
                                            <input name="roll_height" type="number" value={formData.roll_height} onChange={handleChange} placeholder="10" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Stock Quantity</label>
                                            <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="0" />
                                        </div>
                                        <div className="admin-field">
                                            <label className="admin-checkbox-field mt-6">
                                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                                <span>Product is Active</span>
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                <section className="admin-form-section mt-8">
                                    <h3 className="admin-section-title">Technical Specifications</h3>
                                    <div className="admin-form-grid">
                                        <div className="admin-field">
                                            <label>Material</label>
                                            <input name="material" value={formData.material} onChange={handleChange} placeholder="Non-woven" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Finish</label>
                                            <input name="finish" value={formData.finish} onChange={handleChange} placeholder="Matte" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Washability</label>
                                            <input name="washability" value={formData.washability} onChange={handleChange} placeholder="Washable" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Durability</label>
                                            <input name="durability" value={formData.durability} onChange={handleChange} placeholder="High" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Brand</label>
                                            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Luxe Walls" />
                                        </div>
                                        <div className="admin-field">
                                            <label>Country</label>
                                            <input name="country" value={formData.country} onChange={handleChange} placeholder="Italy" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* TAB 2: MEDIA GALLERY */}
                        {activeTab === 'MEDIA' && (
                            <div className="admin-tab-pane">
                                <section className="admin-form-section">
                                    <h3 className="admin-section-title">Product Gallery (6 Images)</h3>
                                    <div className="admin-gallery-grid">
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
                                                <div key={idx} className="admin-slot-item">
                                                    <label className="admin-slot-label">{idx + 1}. {label}</label>
                                                    <div className="admin-slot-card">
                                                        {img ? (
                                                            <>
                                                                <img src={img.url} alt={label} />
                                                                <div className="admin-slot-actions">
                                                                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="admin-action-btn" title="Download">
                                                                        <Download size={14} />
                                                                    </a>
                                                                    <label className="admin-action-btn" title="Replace">
                                                                        <RefreshCw size={14} />
                                                                        <input type="file" onChange={(e) => handleSpecificImageUpload(e, idx)} hidden accept="image/*" disabled={uploading} />
                                                                    </label>
                                                                    <button type="button" className="admin-action-btn" onClick={() => removeImage(idx)}>
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <label className="admin-add-slot">
                                                                {uploading ? <Loader2 className="admin-spin" size={16} /> : <Plus size={20} />}
                                                                <input type="file" onChange={(e) => handleSpecificImageUpload(e, idx)} hidden accept="image/*" disabled={uploading} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <h3 className="admin-section-title mt-8">Product Video</h3>
                                    <div className="admin-video-upload-section">
                                        <div className="admin-slot-item" style={{ maxWidth: '240px' }}>
                                            <label className="admin-slot-label">1. Sponge Wash Video</label>
                                            <div className="admin-slot-card video-slot">
                                                {formData.videos[0] ? (
                                                    <>
                                                        <video src={formData.videos[0].url} className="w-full h-full object-cover" />
                                                        <div className="admin-slot-actions">
                                                            <a href={formData.videos[0].url} target="_blank" rel="noopener noreferrer" className="admin-action-btn" title="Download">
                                                                <Download size={14} />
                                                            </a>
                                                            <label className="admin-action-btn" title="Replace">
                                                                <RefreshCw size={14} />
                                                                <input type="file" onChange={(e) => handleSpecificVideoUpload(e, 0)} hidden accept="video/*" disabled={uploading} />
                                                            </label>
                                                            <button type="button" className="admin-action-btn" onClick={() => removeVideo(0)}>
                                                                    <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <label className="admin-add-slot">
                                                        {uploading ? <Loader2 className="admin-spin" size={16} /> : <Plus size={20} />}
                                                        <input type="file" onChange={(e) => handleSpecificVideoUpload(e, 0)} hidden accept="video/*" disabled={uploading} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* TAB 3: CLASSIFICATION (GROUPS & CATEGORIES) */}
                        {activeTab === 'CLASSIFICATION' && (
                            <div className="admin-tab-pane">
                                <section className="admin-form-section">
                                    <div className="admin-section-header">
                                        <h3 className="admin-section-title">Collection Groups</h3>
                                    </div>
                                    <div className="admin-category-selector-compact mb-8">
                                        {groups.map(group => (
                                            <button
                                                key={group.id}
                                                type="button"
                                                className={`admin-compact-chip ${formData.group_ids.includes(group.id) ? 'active' : ''}`}
                                                onClick={() => handleGroupToggle(group.id)}
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="admin-section-header">
                                        <h3 className="admin-section-title">Product Categories</h3>
                                        <div className="admin-search-field">
                                            <input 
                                                type="text" 
                                                placeholder="Search categories..." 
                                                value={categorySearch}
                                                onChange={(e) => setCategorySearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="admin-category-group-container">
                                        {/* Grouping categories by their parent group */}
                                        {groups.map(group => {
                                            const groupCats = categories.filter(c => 
                                                c.group_id === group.id && 
                                                c.name.toLowerCase().includes(categorySearch.toLowerCase())
                                            );
                                            if (groupCats.length === 0) return null;

                                            return (
                                                <div key={group.id} className="admin-cat-group-box">
                                                    <h4 className="admin-cat-group-title">{group.name}</h4>
                                                    <div className="admin-cat-chips-grid">
                                                        {groupCats.map(cat => (
                                                            <button
                                                                key={cat.id}
                                                                type="button"
                                                                className={`admin-cat-chip-small ${formData.category_ids.includes(cat.id) ? 'active' : ''}`}
                                                                onClick={() => handleCategoryToggle(cat.id)}
                                                            >
                                                                {cat.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Handle categories without a group or whose group isn't in 'groups' list */}
                                        {categories.filter(c => 
                                            !groups.find(g => g.id === c.group_id) && 
                                            c.name.toLowerCase().includes(categorySearch.toLowerCase())
                                        ).length > 0 && (
                                            <div className="admin-cat-group-box">
                                                <h4 className="admin-cat-group-title">Other Categories</h4>
                                                <div className="admin-cat-chips-grid">
                                                    {categories.filter(c => 
                                                        !groups.find(g => g.id === c.group_id) && 
                                                        c.name.toLowerCase().includes(categorySearch.toLowerCase())
                                                    ).map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            className={`admin-cat-chip-small ${formData.category_ids.includes(cat.id) ? 'active' : ''}`}
                                                            onClick={() => handleCategoryToggle(cat.id)}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* TAB 4: STORYTELLING */}
                        {activeTab === 'STORY' && (
                            <div className="admin-tab-pane">
                                <section className="admin-form-section">
                                    <h3 className="admin-section-title">Narrative & Product Story</h3>
                                    <div className="admin-form-grid">
                                        <div className="admin-field full">
                                            <label>Tagline (The punchy one-liner)</label>
                                            <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. For homes that want warmth..." />
                                        </div>
                                        <div className="admin-field full">
                                            <label>Vibe (Mood, feel, and atmosphere)</label>
                                            <textarea name="vibe" value={formData.vibe} onChange={handleChange} rows="3" placeholder="Describe the soul of this wallpaper..." />
                                        </div>
                                        <div className="admin-field full">
                                            <label>Choose this design if…</label>
                                            <textarea name="choose_if" value={formData.choose_if} onChange={handleChange} rows="3" placeholder="You want a warm, cosy living room..." />
                                        </div>
                                        <div className="admin-field full">
                                            <label>Ideal For (The perfect rooms/usage)</label>
                                            <input name="ideal_for" value={formData.ideal_for} onChange={handleChange} placeholder="Master Bedroom, Living Room, Feature Wall..." />
                                        </div>
                                        <div className="admin-field full mt-2">
                                            <label>Detailed Description</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Full technical and aesthetic description..." />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'BOOKS' && (
                            <div className="admin-tab-pane">
                                <section className="admin-form-section">
                                    <div className="admin-section-header">
                                        <h3 className="admin-section-title">Assign to Sample Books</h3>
                                        <div className="admin-search-field">
                                            <input 
                                                type="text" 
                                                placeholder="Search books..." 
                                                value={bookSearch}
                                                onChange={(e) => setBookSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="admin-category-group-container">
                                        <div className="admin-cat-group-box">
                                            <div className="admin-cat-chips-grid">
                                                {books.filter(b => 
                                                    b.name.toLowerCase().includes(bookSearch.toLowerCase()) ||
                                                    b.code?.toLowerCase().includes(bookSearch.toLowerCase())
                                                ).map(book => (
                                                    <button
                                                        key={book.id}
                                                        type="button"
                                                        className={`admin-cat-chip-small ${formData.book_ids.includes(book.id) ? 'active' : ''}`}
                                                        onClick={() => handleBookToggle(book.id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <BookOpen size={12} />
                                                        <span>{book.name}</span>
                                                        {book.code && <span style={{ opacity: 0.6, fontSize: '10px' }}>({book.code})</span>}
                                                    </button>
                                                ))}
                                                {books.length === 0 && (
                                                    <div className="admin-empty-state">No books available.</div>
                                                )}
                                                {books.length > 0 && books.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()) || b.code?.toLowerCase().includes(bookSearch.toLowerCase())).length === 0 && (
                                                    <div className="admin-empty-state">No books match your search.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>

                    <footer className="admin-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {wallpaper ? 'Update Product' : 'Create Product'}
                        </button>
                    </footer>
                </form>
            </div>

        </div>
    );
};

export default WallpaperModal;
