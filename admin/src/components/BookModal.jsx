import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const BookModal = ({ isOpen, onClose, onSave, book }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        image_url: '',
        is_active: true
    });

    useEffect(() => {
        if (book) {
            setFormData({
                name: book.name || '',
                code: book.code || '',
                description: book.description || '',
                image_url: book.image_url || '',
                is_active: book.is_active
            });
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                image_url: '',
                is_active: true
            });
        }
    }, [book, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Book Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Royal Collection 2026"
                        />
                    </div>

                    <div className="form-group">
                        <label>Book Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="e.g. RC-2026"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Cover Image URL</label>
                        <input
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                        {formData.image_url && (
                            <div className="image-preview-box">
                                <img src={formData.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}

                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <span>Active Status</span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} />
                            <span>{book ? 'Update Book' : 'Create Book'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
                .modal-content { background: var(--bg-card); border-radius: 1rem; border: 1px solid var(--border-color); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: scaleIn 0.2s ease-out; }
                .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
                .modal-header h2 { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin: 0; }
                .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-main); }
                
                .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--text-main); }
                .form-group input, .form-group textarea { background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 0.5rem; color: var(--text-main); font-size: 0.9375rem; transition: border-color 0.2s; outline: none; }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); }
                
                .checkbox-group { margin-top: 0.5rem; }
                .checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
                .checkbox-label input[type="checkbox"] { width: 1.25rem; height: 1.25rem; border-radius: 0.25rem; accent-color: var(--primary); }
                .checkbox-label span { font-size: 0.9375rem; color: var(--text-main); }
                
                .image-preview-box { margin-top: 0.5rem; width: 100px; height: 140px; border-radius: 0.5rem; overflow: hidden; background: var(--bg-dark); }
                .image-preview-box img { width: 100%; height: 100%; object-fit: cover; }

                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default BookModal;
