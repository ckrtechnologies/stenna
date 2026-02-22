import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import CategoryModal from '../components/CategoryModal';
import Loader from '../components/Loader';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, groupRes] = await Promise.all([
                api.get('/categories'),
                api.get('/groups')
            ]);
            setCategories(catRes.data);
            setGroups(groupRes.data);
        } catch (error) {
            console.error('Failed to fetch categories or groups', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupToggle = (groupId) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleAdd = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? All wallpapers in this category might also be affected.')) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                alert('Failed to delete category');
            }
        }
    };

    const handleSave = async (data) => {
        try {
            if (currentCategory) {
                await api.put(`/categories/${currentCategory.id}`, data);
            } else {
                await api.post('/categories', data);
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            alert('Failed to save category');
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(category.group_id);
        return matchesSearch && matchesGroup;
    });

    return (
        <div className="categories-page">
            <header className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p>Organize your wallpapers into manageable groups.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    <span>Add New Category</span>
                </button>
            </header>

            <div className="categories-container">
                <aside className="filter-panel">
                    <div className="filter-header">
                        <Filter size={18} />
                        <h3>Filter by Group</h3>
                    </div>
                    <div className="filter-list">
                        {groups.map(group => (
                            <label key={group.id} className={`filter-item ${selectedGroups.includes(group.id) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedGroups.includes(group.id)}
                                    onChange={() => handleGroupToggle(group.id)}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="group-name">{group.name}</span>
                            </label>
                        ))}
                    </div>
                </aside>

                <main className="categories-content">
                    <div className="table-controls">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Group</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4"><Loader message="Loading categories..." /></td></tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr><td colSpan="4" className="empty">No categories found matching your filters.</td></tr>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <tr key={category.id}>
                                            <td>
                                                <div className="cat-cell">
                                                    <ChevronRight size={14} className="text-primary" />
                                                    <strong style={{ color: 'var(--text-main)' }}>{category.name}</strong>
                                                </div>
                                            </td>
                                            <td><code>{category.slug}</code></td>
                                            <td>
                                                <span className="group-badge">
                                                    {groups.find(g => g.id === category.group_id)?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="icon-btn" onClick={() => handleEdit(category)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn red" onClick={() => handleDelete(category.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                category={currentCategory}
            />
        </div>
    );
};

export default Categories;
