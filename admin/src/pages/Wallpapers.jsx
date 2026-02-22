import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Download,
    Upload,
    X,
    RotateCcw
} from 'lucide-react';
import api from '../utils/api';
import WallpaperModal from '../components/WallpaperModal';
import Loader from '../components/Loader';

const Wallpapers = () => {
    const [wallpapers, setWallpapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWallpaper, setCurrentWallpaper] = useState(null);

    // Filter state
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        group_id: '',
        category_id: '',
        is_active: 'all',
        brand: '',
        material: ''
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        fetchWallpapers();
        fetchCategories();
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        }
    };

    const fetchWallpapers = async () => {
        try {
            const res = await api.get('/wallpapers');
            setWallpapers(res.data);
        } catch (error) {
            console.error('Failed to fetch wallpapers', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleAdd = () => {
        setCurrentWallpaper(null);
        setIsModalOpen(true);
    };

    const handleEdit = (wallpaper) => {
        setCurrentWallpaper(wallpaper);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this wallpaper?')) {
            try {
                await api.delete(`/wallpapers/${id}`);
                setWallpapers(wallpapers.filter(w => w.id !== id));
            } catch (error) {
                alert('Failed to delete wallpaper');
            }
        }
    };

    const handleSave = async (data) => {
        try {
            if (currentWallpaper) {
                const res = await api.put(`/wallpapers/${currentWallpaper.id}`, data);
                // The update might return data slightly differently or we need to refresh list
                fetchWallpapers();
            } else {
                await api.post('/wallpapers', data);
                fetchWallpapers();
            }
            setIsModalOpen(false);
        } catch (error) {
            alert('Failed to save wallpaper');
        }
    };

    const filteredWallpapers = wallpapers.filter(w => {
        const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.design_code?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGroup = !filters.group_id || w.groups?.some(g => g.id === filters.group_id);
        const matchesCategory = !filters.category_id || w.categories?.some(c => c.id === filters.category_id);
        const matchesBrand = !filters.brand || w.brand === filters.brand;
        const matchesMaterial = !filters.material || w.material === filters.material;
        const matchesStatus = filters.is_active === 'all' ||
            (filters.is_active === 'active' ? w.is_active : !w.is_active);

        return matchesSearch && matchesGroup && matchesCategory && matchesBrand && matchesMaterial && matchesStatus;
    });

    const downloadCSV = () => {
        if (filteredWallpapers.length === 0) return;

        // Header
        const headers = ['Name', 'Design Code', 'Price', 'Status', 'Material', 'Brand', 'Categories', 'Groups'];

        // Rows
        const rows = filteredWallpapers.map(w => [
            `"${w.name}"`,
            `"${w.design_code || ''}"`,
            w.price || 0,
            w.is_active ? 'Active' : 'Hidden',
            `"${w.material || ''}"`,
            `"${w.brand || ''}"`,
            `"${w.categories?.map(c => c.name).join(', ') || ''}"`,
            `"${w.groups?.map(g => g.name).join(', ') || ''}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `wallpapers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            group_id: '',
            category_id: '',
            is_active: 'all',
            brand: '',
            material: ''
        });
        setSearchTerm('');
    };

    const handleView = (wallpaper) => {
        // Since we don't have a public view yet, we'll open the main image in a new tab
        const imageUrl = wallpaper.images?.[0]?.image_url;
        if (imageUrl) {
            window.open(imageUrl, '_blank');
        } else {
            alert('No image available for this wallpaper.');
        }
    };

    const paginatedWallpapers = filteredWallpapers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredWallpapers.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Get unique values for select filters
    const brands = [...new Set(wallpapers.map(w => w.brand).filter(Boolean))];
    const materials = [...new Set(wallpapers.map(w => w.material).filter(Boolean))];

    return (
        <div className="wallpapers-page">
            <header className="page-header">
                <div>
                    <h1>Wallpapers</h1>
                    <p>Manage your collection of {wallpapers.length} wallpapers.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    <span>Add New</span>
                </button>
            </header>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search wallpapers..."
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
                            <label>Group</label>
                            <select name="group_id" value={filters.group_id} onChange={handleFilterChange}>
                                <option value="">All Groups</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-field">
                            <label>Category</label>
                            <select name="category_id" value={filters.category_id} onChange={handleFilterChange}>
                                <option value="">All Categories</option>
                                {categories
                                    .filter(c => !filters.group_id || c.group_id === filters.group_id)
                                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                }
                            </select>
                        </div>
                        <div className="filter-field">
                            <label>Brand</label>
                            <select name="brand" value={filters.brand} onChange={handleFilterChange}>
                                <option value="">All Brands</option>
                                {brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="filter-field">
                            <label>Material</label>
                            <select name="material" value={filters.material} onChange={handleFilterChange}>
                                <option value="">All Materials</option>
                                {materials.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="filter-field">
                            <label>Status</label>
                            <select name="is_active" value={filters.is_active} onChange={handleFilterChange}>
                                <option value="all">Any Status</option>
                                <option value="active">Active Only</option>
                                <option value="hidden">Hidden Only</option>
                            </select>
                        </div>
                        <div className="filter-actions">
                            <button className="btn-text" onClick={clearFilters}>
                                <RotateCcw size={14} />
                                <span>Reset Filters</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7"><Loader message="Fetching wallpapers..." /></td></tr>
                        ) : filteredWallpapers.length === 0 ? (
                            <tr><td colSpan="7" className="empty">No wallpapers found.</td></tr>
                        ) : (
                            paginatedWallpapers.map((wallpaper, index) => {
                                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                return (
                                    <tr key={wallpaper.id}>
                                        <td>{serialNumber}</td>
                                        <td>
                                            <img
                                                src={wallpaper.images?.[0]?.image_url || 'https://via.placeholder.com/48'}
                                                alt={wallpaper.name}
                                                className="img-preview"
                                            />
                                        </td>
                                        <td>
                                            <div className="name-cell">
                                                <strong>{wallpaper.name}</strong>
                                                <span>{wallpaper.design_code || wallpaper.slug}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cat-stack">
                                                {wallpaper.categories?.length > 0
                                                    ? wallpaper.categories.map(c => <span key={c.id} className="small-pill">{c.name}</span>)
                                                    : 'Uncategorized'
                                                }
                                            </div>
                                        </td>
                                        <td>Rs {wallpaper.price || '0'}</td>
                                        <td>
                                            <span className={`stock-level ${wallpaper.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                {wallpaper.quantity || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${wallpaper.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {wallpaper.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="icon-btn" title="View" onClick={() => handleView(wallpaper)}><Eye size={16} /></button>
                                            <button className="icon-btn" title="Edit" onClick={() => handleEdit(wallpaper)}><Edit size={16} /></button>
                                            <button className="icon-btn red" title="Delete" onClick={() => handleDelete(wallpaper.id)}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-footer">
                <div className="pagination-info">
                    Showing <span>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredWallpapers.length)}</span> to <span>{Math.min(currentPage * itemsPerPage, filteredWallpapers.length)}</span> of <span>{filteredWallpapers.length}</span> products
                </div>
                <div className="pagination-controls">
                    <div className="page-size">
                        <label>Items per page:</label>
                        <select value={itemsPerPage} onChange={(e) => {
                            setItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                        }}>
                            {[10, 20, 50, 100, 200, 500].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="page-buttons">
                        <button
                            className="p-btn"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>
                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((p, i, arr) => {
                                    if (i > 0 && p - arr[i - 1] > 1) {
                                        return <span key={`dots-${p}`} className="dots">...</span>;
                                    }
                                    return (
                                        <button
                                            key={p}
                                            className={`p-num ${currentPage === p ? 'active' : ''}`}
                                            onClick={() => handlePageChange(p)}
                                        >
                                            {p}
                                        </button>
                                    );
                                })
                            }
                        </div>
                        <button
                            className="p-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <WallpaperModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                wallpaper={currentWallpaper}
                categories={categories}
                groups={groups}
            />

            <style jsx>{`
                .img-preview { width: 44px; height: 44px; border-radius: 0.5rem; object-fit: cover; background: var(--bg-dark); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .name-cell { display: flex; flex-direction: column; }
                .name-cell strong { color: var(--text-main); font-size: 0.9375rem; }
                .name-cell span { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.125rem; }
                .actions { display: flex; gap: 0.5rem; }
                .loading, .empty { padding: 4rem; text-align: center; color: var(--text-dim); }
                .cat-stack { display: flex; flex-wrap: wrap; gap: 0.25rem; max-width: 180px; }
                .small-pill { font-size: 0.65rem; padding: 0.1rem 0.4rem; background: var(--border-highlight); border-radius: 4px; color: var(--text-muted); border: 1px solid var(--border-color); }
                
                /* Tighten Table */
                table { border-collapse: separate; border-spacing: 0; }
                th { background: var(--bg-header-bar); border-bottom: 2px solid var(--border-color); }
                td { padding: 0.875rem 1.5rem; border-bottom: 1px solid var(--border-color); }
                tr:last-child td { border-bottom: none; }
                tr:hover td { background: var(--bg-hover); }
                
                .control-buttons { display: flex; gap: 0.75rem; }
                .filter-panel { 
                    margin-bottom: 2rem; 
                    padding: 1.5rem; 
                    border-radius: 1rem; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border-color); 
                    animation: slideDown 0.3s ease-out; 
                    position: sticky;
                    top: 1rem;
                    z-index: 100;
                    box-shadow: var(--shadow-premium);
                    backdrop-filter: blur(10px);
                }
                .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; align-items: flex-end; }
                .filter-field { display: flex; flex-direction: column; gap: 0.5rem; }
                .filter-field label { font-size: 0.75rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
                .filter-field select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.6rem; color: var(--text-main); font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
                .filter-field select:focus { border-color: var(--primary); }
                .filter-actions { display: flex; justify-content: flex-end; }
                .btn-text { background: none; border: none; color: var(--text-muted); font-size: 0.8125rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .btn-text:hover { color: var(--primary); background: rgba(59, 130, 246, 0.1); }

                .pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; margin-top: 2rem; border-top: 1px solid var(--border-color); }
                .pagination-info { font-size: 0.875rem; color: var(--text-muted); }
                .pagination-info span { font-weight: 600; color: var(--text-main); }
                .pagination-controls { display: flex; align-items: center; gap: 2rem; }
                .page-size { display: flex; align-items: center; gap: 0.75rem; }
                .page-size label { font-size: 0.8125rem; color: var(--text-dim); }
                .page-size select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.4rem 0.6rem; color: var(--text-main); font-size: 0.875rem; outline: none; }
                .page-buttons { display: flex; align-items: center; gap: 0.5rem; }
                .p-btn { padding: 0.5rem 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 0.5rem; color: var(--text-muted); font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
                .p-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--primary); border-color: var(--primary); }
                .p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-numbers { display: flex; align-items: center; gap: 0.25rem; }
                .p-num { min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid transparent; border-radius: 0.5rem; color: var(--text-muted); font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
                .stock-level { font-weight: 600; font-size: 0.875rem; }
                .in-stock { color: var(--success); }
                .out-of-stock { color: var(--danger); }
                .p-num:hover { color: var(--primary); background: var(--bg-hover); }
                .p-num.active { background: var(--primary); color: white; border-color: var(--primary); }
                .dots { color: var(--text-dim); padding: 0 0.25rem; }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

        </div>
    );
};

export default Wallpapers;
