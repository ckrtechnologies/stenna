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

    // ← KEY FIX: don't render anything when closed
    if (!isOpen) return null;

    return (
        <div className="bm-overlay" onClick={onClose}>
            <div className="bm-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bm-header">
                    <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
                    <button className="bm-close" type="button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bm-body">

                        <div className="bm-field">
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

                        <div className="bm-field">
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

                        <div className="bm-field">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Brief description of the collection..."
                            />
                        </div>

                        <div className="bm-field">
                            <label>Cover Image URL</label>
                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                            {formData.image_url && (
                                <div className="bm-preview">
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bm-field">
                            <label className="bm-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span>Active Status (Visible in catalog)</span>
                            </label>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="bm-footer">
                        <button type="button" className="bm-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="bm-btn-primary">
                            <Save size={17} />
                            <span>{book ? 'Update Book' : 'Create Book'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .bm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1.5rem;
                    animation: bmFadeIn 0.2s ease;
                }
                @keyframes bmFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .bm-modal {
                    background: var(--bg-card, #fff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 1.25rem;
                    width: 100%;
                    max-width: 540px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
                    animation: bmSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes bmSlideIn {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }

                /* Header */
                .bm-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.25rem 1.75rem;
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                    flex-shrink: 0;
                }
                .bm-header h2 {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--text-main, #0f172a);
                    margin: 0;
                }
                .bm-close {
                    background: none;
                    border: none;
                    color: var(--text-muted, #64748b);
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .bm-close:hover {
                    background: rgba(239,68,68,0.1);
                    color: #ef4444;
                }

                /* Body */
                .bm-body {
                    padding: 1.75rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                /* Fields */
                .bm-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .bm-field label {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: var(--text-dim, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .bm-field input,
                .bm-field textarea {
                    background: var(--bg-input, #f8fafc);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: var(--text-main, #0f172a);
                    font-size: 0.9375rem;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit;
                    resize: vertical;
                }
                .bm-field input:focus,
                .bm-field textarea:focus {
                    border-color: var(--primary, #3b82f6);
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
                }
                .bm-field input::placeholder,
                .bm-field textarea::placeholder {
                    color: var(--text-dim, #94a3b8);
                }

                /* Image preview */
                .bm-preview {
                    width: 120px;
                    height: 160px;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: 1px solid var(--border-color, #e2e8f0);
                    background: var(--bg-input, #f8fafc);
                }
                .bm-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Checkbox */
                .bm-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    color: var(--text-main, #0f172a);
                    user-select: none;
                    text-transform: none;
                    letter-spacing: 0;
                }
                .bm-checkbox-label input[type="checkbox"] {
                    width: 1.15rem;
                    height: 1.15rem;
                    border-radius: 0.35rem;
                    accent-color: var(--primary, #3b82f6);
                    cursor: pointer;
                }

                /* Footer */
                .bm-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1.25rem 1.75rem;
                    border-top: 1px solid var(--border-color, #e2e8f0);
                    background: var(--bg-hover, #f8fafc);
                    flex-shrink: 0;
                }
                .bm-btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, var(--primary, #3b82f6), var(--primary-dark, #2563eb));
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0.625rem 1.25rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(37,99,235,0.3);
                }
                .bm-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(37,99,235,0.4);
                }
                .bm-btn-secondary {
                    background: transparent;
                    border: 1px solid var(--border-color, #e2e8f0);
                    color: var(--text-muted, #64748b);
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0.625rem 1.25rem;
                    transition: all 0.2s;
                }
                .bm-btn-secondary:hover {
                    border-color: var(--primary, #3b82f6);
                    color: var(--primary, #3b82f6);
                }
            `}</style>
        </div>
    );
};

export default BookModal;
