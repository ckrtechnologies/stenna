import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
            const res = await api.get('/groups');
            setGroups(res.data);
            console.log("in category model of admin panel :", res.data);
        };
        fetchGroups();

        if (category) {
            setFormData(category);
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="field">
                        <label>Category Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Nature & Landscapes"
                        />
                    </div>

                    <div className="field">
                        <label>Group</label>
                        <select
                            name="group_id"
                            value={formData.group_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Group</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className="field">
                        <label>Slug</label>
                        <input
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            placeholder="nature-landscapes"
                        />
                    </div>

                    <div className="field">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe what kind of wallpapers go in here..."
                        ></textarea>
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {category ? 'Update Category' : 'Create Category'}
                        </button>
                    </footer>
                </form>
            </div>

            <style jsx>{`
                /* Redundant styles removed to use global components.css */
            `}</style>

        </div>
    );
};

export default CategoryModal;
