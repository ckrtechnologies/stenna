import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Layers, Download } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const CategoryGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '' });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ["S.No", "Name", "Slug"];
        const rows = filteredGroups.map((group, index) => [
            index + 1,
            group.name,
            group.slug
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `category_groups_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredGroups = groups.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (group = null) => {
        setCurrentGroup(group);
        setFormData(group || { name: '', slug: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentGroup) {
                await api.put(`/groups/${currentGroup.id}`, formData);
            } else {
                await api.post('/groups', formData);
            }
            fetchGroups();
            setIsModalOpen(false);
        } catch (error) {
            alert('Failed to save group');
        }
    };

    return (
        <div className="groups-page">
            <header className="page-header">
                <div>
                    <h1>Category Groups</h1>
                    <p>High-level organization for your categories (e.g., Rooms, Styles, Colors).</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Add New Group</span>
                </button>
            </header>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary" onClick={exportToCSV} disabled={filteredGroups.length === 0}>
                    <Download size={18} />
                    <span>Export CSV</span>
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4"><Loader message="Loading groups..." /></td></tr>
                        ) : filteredGroups.length === 0 ? (
                            <tr><td colSpan="4" className="empty">No groups found.</td></tr>
                        ) : (
                            filteredGroups.map((group, index) => (
                                <tr key={group.id}>
                                    <td>{index + 1}</td>
                                    <td><strong style={{ color: 'var(--text-main)' }}>{group.name}</strong></td>
                                    <td><code>{group.slug}</code></td>
                                    <td className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="icon-btn" onClick={() => handleOpenModal(group)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="icon-btn red" onClick={async () => {
                                            if (window.confirm('Delete this group? This will cascade to all categories in it.')) {
                                                await api.delete(`/groups/${group.id}`);
                                                fetchGroups();
                                            }
                                        }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>{currentGroup ? 'Edit Group' : 'Add New Group'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                        </header>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="field">
                                <label>Group Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                    })}
                                    required
                                    placeholder="e.g. Room Types"
                                />
                            </div>
                            <div className="field mt-4">
                                <label>Slug</label>
                                <input value={formData.slug} readOnly placeholder="auto-generated-slug" />
                            </div>
                            <footer className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Group</button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .loading, .empty { padding: 4rem; text-align: center; color: #64748b; }
                .mt-4 { margin-top: 1.5rem; }
            `}</style>

        </div>
    );
};

export default CategoryGroups;
