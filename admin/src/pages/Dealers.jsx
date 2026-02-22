import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    BookOpen,
    Eye,
    EyeOff,
    Filter,
    Download,
    RotateCcw,
    MessageCircle
} from 'lucide-react';
import api from '../utils/api';
import DealerModal from '../components/DealerModal';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const Dealers = () => {
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDealer, setCurrentDealer] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ is_active: 'all' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchDealers();
    }, []);

    const fetchDealers = async () => {
        try {
            const res = await api.get('/dealers');
            setDealers(res.data);
        } catch (error) {
            console.error('Failed to fetch dealers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentDealer(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dealer) => {
        setCurrentDealer(dealer);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this dealer?')) {
            try {
                await api.delete(`/dealers/${id}`);
                setDealers(dealers.filter(d => d.id !== id));
            } catch (error) {
                alert('Failed to delete dealer');
            }
        }
    };

    const handleToggleStatus = async (dealer) => {
        try {
            await api.patch(`/dealers/${dealer.id}/status`, { is_active: !dealer.is_active });
            // Optimistic update or refetch
            setDealers(dealers.map(d => d.id === dealer.id ? { ...d, is_active: !d.is_active } : d));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleSave = async (data) => {
        try {
            if (currentDealer) {
                await api.put(`/dealers/${currentDealer.id}`, data);
            } else {
                await api.post('/dealers', data);
            }
            fetchDealers();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save dealer');
        }
    };

    const handleManageBooks = (dealer) => {
        navigate(`/dealers/${dealer.id}/books`);
    };

    const handleWhatsApp = (dealer) => {
        if (dealer.phone) {
            window.open(`https://wa.me/${dealer.phone}`, '_blank');
        } else {
            alert('This dealer does not have a phone number.');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ is_active: 'all' });
        setSearchTerm('');
    };

    const filteredDealers = dealers.filter(d => {
        const matchesSearch = d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filters.is_active === 'all' ||
            (filters.is_active === 'active' ? d.is_active : !d.is_active);

        return matchesSearch && matchesStatus;
    });

    const downloadCSV = () => {
        if (filteredDealers.length === 0) return;

        const headers = ['Name', 'Email', 'Phone', 'Address', 'Status', 'Joined Date'];
        const rows = filteredDealers.map(d => [
            `"${d.name || ''}"`,
            `"${d.email || ''}"`,
            `"${d.phone || ''}"`,
            `"${d.address || ''}"`,
            d.is_active ? 'Active' : 'Inactive',
            `"${d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `dealers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="dealers-page">
            <header className="page-header">
                <div>
                    <h1>Dealers</h1>
                    <p>Manage your dealers and book assignments.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    <span>Add New Dealer</span>
                </button>
            </header>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search dealers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="control-buttons">
                    <button
                        className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ background: showFilters ? 'var(--primary)' : 'var(--bg-card)', color: showFilters ? 'white' : 'var(--text-muted)' }}
                    >
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="btn btn-secondary" onClick={downloadCSV}>
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filter-panel glass-panel">
                    <div className="filter-grid">
                        <div className="filter-field">
                            <label>Status</label>
                            <select name="is_active" value={filters.is_active} onChange={handleFilterChange}>
                                <option value="all">Any Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                        <div className="filter-actions">
                            <button className="btn-text" onClick={clearFilters}>
                                <RotateCcw size={14} />
                                <span style={{ marginLeft: '0.5rem' }}>Reset Filters</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Books</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6"><Loader message="Fetching dealers..." /></td></tr>
                        ) : filteredDealers.length === 0 ? (
                            <tr><td colSpan="6" className="empty">No dealers found.</td></tr>
                        ) : (
                            filteredDealers.map(dealer => (
                                <tr key={dealer.id}>
                                    <td>
                                        <div className="name-cell">
                                            <strong>{dealer.name}</strong>
                                            <span>{dealer.address || 'No address'}</span>
                                        </div>
                                    </td>
                                    <td>{dealer.email}</td>
                                    <td>{dealer.phone || '-'}</td>
                                    <td>
                                        <button
                                            className={`badge ${dealer.is_active ? 'badge-success' : 'badge-muted'}`}
                                            onClick={() => handleToggleStatus(dealer)}
                                            title="Click to toggle status"
                                        >
                                            {dealer.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <button className="btn-icon-text" onClick={() => handleManageBooks(dealer)}>
                                            <BookOpen size={16} />
                                            <span>Manage Books</span>
                                        </button>
                                    </td>
                                    <td className="actions">
                                        <button className="icon-btn" title="WhatsApp" onClick={() => handleWhatsApp(dealer)} style={{ color: '#25D366', borderColor: '#25D366' }}>
                                            <MessageCircle size={16} />
                                        </button>
                                        <button className="icon-btn" title="Edit" onClick={() => handleEdit(dealer)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="icon-btn red" title="Delete" onClick={() => handleDelete(dealer.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <DealerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                dealer={currentDealer}
            />

            <style jsx>{`
                .name-cell { display: flex; flex-direction: column; }
                .name-cell strong { color: var(--text-main); font-size: 0.9375rem; }
                .name-cell span { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.125rem; }

                .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; border: none; cursor: pointer; }
                .badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .badge-muted { background: rgba(148, 163, 184, 0.1); color: var(--text-muted); }

                .actions { display: flex; gap: 0.5rem; }
                .empty { text-align: center; padding: 4rem; color: var(--text-dim); font-style: italic; }
            `}</style>
        </div >
    );
};

export default Dealers;
