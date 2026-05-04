import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../utils/api';

const CategoryModal = ({ isOpen, onClose, onSave, category }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        group_id: ''
    });
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setGroups(res.data);
            } catch (err) {
                console.error("Error fetching groups:", err);
            }
        };
        fetchGroups();

        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                group_id: category.group_id || ''
            });
        } else {
            setFormData({ name: '', slug: '', description: '', group_id: '' });
        }
    }, [category, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'name' && !category) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content admin-modal-standard" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2 className="admin-modal-title">{category ? 'Edit Category' : 'Add New Category'}</h2>
                    <button className="admin-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-modal-form">
                    <div className="admin-modal-body">
                        <div className="admin-form-grid">
                            <div className="admin-field full">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Nature & Landscapes"
                                />
                            </div>

                            <div className="admin-field full">
                                <label>Parent Group</label>
                                <select
                                    name="group_id"
                                    value={formData.group_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a Group</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-field full">
                                <label>URL Slug (Auto-generated)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    placeholder="nature-landscapes"
                                />
                            </div>

                            <div className="admin-field full">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe the aesthetic and target audience..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="admin-btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn primary">
                            <Save size={18} />
                            <span>{category ? 'Update Category' : 'Create Category'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
