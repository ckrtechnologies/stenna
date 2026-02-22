import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Image as ImageIcon,
    Search
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const BookWallpapers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [assignedWallpapers, setAssignedWallpapers] = useState([]);
    const [availableWallpapers, setAvailableWallpapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchData();
        fetchAvailableWallpapers();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/books/${id}`);
            setBook(res.data);
            setAssignedWallpapers(res.data.wallpapers || []);
        } catch (error) {
            console.error('Failed to fetch book data', error);
            alert('Failed to load book data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableWallpapers = async () => {
        try {
            const [wallpapersRes, categoriesRes, groupsRes] = await Promise.all([
                api.get('/wallpapers'),
                api.get('/categories'),
                api.get('/groups')
            ]);
            setAvailableWallpapers(wallpapersRes.data);
            setCategories(categoriesRes.data);
            setGroups(groupsRes.data);
        } catch (error) {
            console.error('Failed to fetch available wallpapers', error);
        }
    };

    const handleAssign = async (wallpaperId) => {
        try {
            await api.post(`/books/${id}/wallpapers`, { wallpaperId });
            // Refresh
            fetchData();
            setIsAssignModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to assign wallpaper');
        }
    };

    const handleRemove = async (wallpaperId) => {
        if (window.confirm('Are you sure you want to remove this wallpaper from the book?')) {
            try {
                await api.delete(`/books/${id}/wallpapers/${wallpaperId}`);
                setAssignedWallpapers(assignedWallpapers.filter(w => w.id !== wallpaperId));
            } catch (error) {
                alert('Failed to remove wallpaper');
            }
        }
    };

    const unassignedWallpapers = availableWallpapers.filter(w =>
        !assignedWallpapers.some(aw => aw.id === w.id) &&
        (w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.design_code?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedGroup || w.groups?.some(g => g.id === selectedGroup)) &&
        (!selectedCategory || w.categories?.some(c => c.id === selectedCategory))
    );

    if (loading) return <div className="page-container"><Loader message="Loading book wallpapers..." /></div>;
    if (!book) return <div className="page-container">Book not found</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <button className="back-btn" onClick={() => navigate('/books')}>
                        <ArrowLeft size={20} />
                        <span>Back to Books</span>
                    </button>
                    <h1>{book.name}'s Wallpapers</h1>
                    <p>Manage wallpapers in this book ({assignedWallpapers.length} items)</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAssignModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Wallpaper</span>
                </button>
            </header>

            <div className="wallpapers-grid">
                {assignedWallpapers.length === 0 ? (
                    <div className="empty-state">
                        <ImageIcon size={48} />
                        <p>No wallpapers in this book yet.</p>
                        <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(true)}>
                            Add First Wallpaper
                        </button>
                    </div>
                ) : (
                    assignedWallpapers.map(wallpaper => (
                        <div key={wallpaper.id} className="wallpaper-card">
                            <div className="wallpaper-preview">
                                <img
                                    src={wallpaper.images?.[0]?.image_url || 'https://via.placeholder.com/200'}
                                    alt={wallpaper.name}
                                />
                                <div className="overlay">
                                    <button className="remove-btn-icon" onClick={() => handleRemove(wallpaper.id)} title="Remove from book">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="wallpaper-info">
                                <h3>{wallpaper.name}</h3>
                                <span>{wallpaper.design_code}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isAssignModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Wallpaper to Book</h2>
                            <button className="close-btn" onClick={() => setIsAssignModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="filter-row">
                                <select
                                    className="filter-select"
                                    value={selectedGroup}
                                    onChange={e => setSelectedGroup(e.target.value)}
                                >
                                    <option value="">All Groups</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <select
                                    className="filter-select"
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories
                                        .filter(c => !selectedGroup || c.group_id === selectedGroup)
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    }
                                </select>
                            </div>
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or code..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="wallpaper-list">
                                {unassignedWallpapers.length === 0 ? (
                                    <p className="no-results">No matching wallpapers found.</p>
                                ) : (
                                    unassignedWallpapers.map(wallpaper => (
                                        <div key={wallpaper.id} className="wallpaper-list-item">
                                            <div className="list-item-preview">
                                                <img
                                                    src={wallpaper.images?.[0]?.image_url || 'https://via.placeholder.com/40'}
                                                    alt={wallpaper.name}
                                                />
                                            </div>
                                            <div className="list-item-info">
                                                <strong>{wallpaper.name}</strong>
                                                <span>{wallpaper.design_code}</span>
                                            </div>
                                            <button className="btn-sm btn-primary" onClick={() => handleAssign(wallpaper.id)}>
                                                Add
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .back-btn { background: none; border: none; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); cursor: pointer; margin-bottom: 1rem; font-size: 0.875rem; padding: 0; }
                .back-btn:hover { color: var(--primary); }
                .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
                
                .btn { display: flex; align-items: center; gap: 0.625rem; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; height: 42px; padding: 0 1.25rem; }
                .btn-primary { background: var(--primary); color: white; }
                .btn-secondary { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); }
                
                .wallpapers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
                .wallpaper-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; transition: transform 0.2s; position: relative; }
                .wallpaper-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
                
                .wallpaper-preview { height: 200px; position: relative; background: var(--bg-dark); }
                .wallpaper-preview img { width: 100%; height: 100%; object-fit: cover; }
                
                .overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; }
                .wallpaper-card:hover .overlay { opacity: 1; }
                
                .remove-btn-icon { background: #ef4444; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: scale(0.9); transition: transform 0.2s; }
                .remove-btn-icon:hover { transform: scale(1); }
                
                .wallpaper-info { padding: 1rem; }
                .wallpaper-info h3 { font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin: 0 0 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .wallpaper-info span { font-size: 0.75rem; color: var(--text-muted); }
                
                .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center; color: var(--text-dim); gap: 1rem; border: 2px dashed var(--border-color); border-radius: 1rem; }
                
                /* Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: var(--bg-card); border-radius: 1rem; border: 1px solid var(--border-color); width: 100%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; }
                .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
                .modal-body { padding: 1.5rem; overflow-y: auto; }
                
                .filter-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .filter-select { flex: 1; padding: 0.6rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-main); font-size: 0.875rem; outline: none; }
                .filter-select:focus { border-color: var(--primary); }

                .search-box { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-input); padding: 0.5rem 1rem; border-radius: 0.75rem; margin-bottom: 1rem; border: 1px solid var(--border-color); }
                .search-box input { border: none; background: none; outline: none; width: 100%; color: var(--text-main); }
                
                .wallpaper-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .wallpaper-list-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.5rem; background: var(--bg-input); border: 1px solid transparent; }
                .wallpaper-list-item:hover { border-color: var(--primary); }
                
                .list-item-preview { width: 40px; height: 40px; border-radius: 0.25rem; overflow: hidden; background: var(--bg-dark); }
                .list-item-preview img { width: 100%; height: 100%; object-fit: cover; }
                
                .list-item-info { flex: 1; display: flex; flex-direction: column; }
                .list-item-info strong { font-size: 0.875rem; color: var(--text-main); }
                .list-item-info span { font-size: 0.75rem; color: var(--text-muted); }
                
                .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.75rem; height: 28px; border-radius: 0.25rem; }
                .no-results { text-align: center; color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default BookWallpapers;
