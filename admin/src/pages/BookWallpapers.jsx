import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Image as ImageIcon,
    Search,
    CheckSquare,
    Square,
    X,
    Check
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
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [saving, setSaving] = useState(false);

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

    const openAssignModal = () => {
        setSelectedIds(new Set());
        setSearchTerm('');
        setSelectedGroup('');
        setSelectedCategory('');
        setIsAssignModalOpen(true);
    };

    const toggleSelect = (wallpaperId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(wallpaperId)) {
                next.delete(wallpaperId);
            } else {
                next.add(wallpaperId);
            }
            return next;
        });
    };

    const toggleSelectAll = (visibleIds) => {
        const allSelected = visibleIds.every(wid => selectedIds.has(wid));
        if (allSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                visibleIds.forEach(wid => next.delete(wid));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                visibleIds.forEach(wid => next.add(wid));
                return next;
            });
        }
    };

    const handleBulkAssign = async () => {
        if (selectedIds.size === 0) return;
        setSaving(true);
        try {
            await api.post(`/books/${id}/wallpapers/bulk`, {
                wallpaperIds: Array.from(selectedIds)
            });
            await fetchData();
            setIsAssignModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to assign wallpapers');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (wallpaperId) => {
        if (window.confirm('Remove this wallpaper from the book?')) {
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
        (w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.design_code?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedGroup || w.groups?.some(g => g.id === selectedGroup)) &&
        (!selectedCategory || w.categories?.some(c => c.id === selectedCategory))
    );

    const visibleIds = unassignedWallpapers.map(w => w.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(wid => selectedIds.has(wid));

    if (loading) return <div className="bw-page"><Loader message="Loading book wallpapers..." /></div>;
    if (!book) return <div className="bw-page">Book not found</div>;

    return (
        <div className="bw-page">
            <header className="bw-header">
                <div>
                    <button className="bw-back-btn" onClick={() => navigate('/books')}>
                        <ArrowLeft size={18} />
                        <span>Back to Books</span>
                    </button>
                    <h1>{book.name}</h1>
                    <p>{assignedWallpapers.length} wallpaper{assignedWallpapers.length !== 1 ? 's' : ''} in this book</p>
                </div>
                <button className="bw-btn-primary" onClick={openAssignModal}>
                    <Plus size={20} />
                    <span>Add Wallpapers</span>
                </button>
            </header>

            {assignedWallpapers.length === 0 ? (
                <div className="bw-empty">
                    <ImageIcon size={52} strokeWidth={1.2} />
                    <p>No wallpapers in this book yet.</p>
                    <button className="bw-btn-secondary" onClick={openAssignModal}>
                        Add First Wallpaper
                    </button>
                </div>
            ) : (
                <div className="bw-grid">
                    {assignedWallpapers.map(wallpaper => (
                        <div key={wallpaper.id} className="bw-card">
                            <div className="bw-card-preview">
                                <img
                                    src={wallpaper.images?.[0]?.image_url || 'https://placehold.co/200x200/1e293b/94a3b8?text=No+Image'}
                                    alt={wallpaper.name}
                                />
                                <div className="bw-card-overlay">
                                    <button
                                        className="bw-remove-btn"
                                        onClick={() => handleRemove(wallpaper.id)}
                                        title="Remove from book"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="bw-card-info">
                                <strong>{wallpaper.name}</strong>
                                <span>{wallpaper.design_code}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Assign Modal ── */}
            {isAssignModalOpen && (
                <div className="bw-modal-bg" onClick={() => setIsAssignModalOpen(false)}>
                    <div className="bw-modal" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bw-modal-header">
                            <div>
                                <h2>Add Wallpapers to Book</h2>
                                <p>Select one or more wallpapers to add</p>
                            </div>
                            <button className="bw-modal-close" onClick={() => setIsAssignModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bw-modal-filters">
                            <div className="bw-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by name or code..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="bw-filter-row">
                                <select
                                    value={selectedGroup}
                                    onChange={e => { setSelectedGroup(e.target.value); setSelectedCategory(''); }}
                                >
                                    <option value="">All Groups</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <select
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
                        </div>

                        {/* Select All bar */}
                        {unassignedWallpapers.length > 0 && (
                            <div className="bw-select-all-bar">
                                <button
                                    className="bw-select-all-btn"
                                    onClick={() => toggleSelectAll(visibleIds)}
                                >
                                    {allVisibleSelected
                                        ? <CheckSquare size={18} />
                                        : <Square size={18} />
                                    }
                                    <span>
                                        {allVisibleSelected ? 'Deselect All' : 'Select All'} ({unassignedWallpapers.length} shown)
                                    </span>
                                </button>
                                {selectedIds.size > 0 && (
                                    <span className="bw-selected-count">
                                        {selectedIds.size} selected
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Wallpaper List */}
                        <div className="bw-modal-list">
                            {unassignedWallpapers.length === 0 ? (
                                <div className="bw-no-results">
                                    <Search size={32} strokeWidth={1.2} />
                                    <p>No matching wallpapers found.</p>
                                </div>
                            ) : (
                                unassignedWallpapers.map(wallpaper => {
                                    const isSelected = selectedIds.has(wallpaper.id);
                                    return (
                                        <div
                                            key={wallpaper.id}
                                            className={`bw-list-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleSelect(wallpaper.id)}
                                        >
                                            <div className={`bw-checkbox ${isSelected ? 'checked' : ''}`}>
                                                {isSelected && <Check size={12} strokeWidth={3} />}
                                            </div>
                                            <div className="bw-list-thumb">
                                                <img
                                                    src={wallpaper.images?.[0]?.image_url || 'https://placehold.co/50x50/1e293b/94a3b8?text=?'}
                                                    alt={wallpaper.name}
                                                />
                                            </div>
                                            <div className="bw-list-info">
                                                <strong>{wallpaper.name}</strong>
                                                <span>{wallpaper.design_code}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bw-modal-footer">
                            <button
                                className="bw-btn-secondary"
                                onClick={() => setIsAssignModalOpen(false)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="bw-btn-primary"
                                onClick={handleBulkAssign}
                                disabled={selectedIds.size === 0 || saving}
                            >
                                {saving ? (
                                    <span className="bw-saving">Adding...</span>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        <span>
                                            Add Selected{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bw-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }

                /* Header */
                .bw-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .bw-back-btn { background: none; border: none; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); cursor: pointer; margin-bottom: 0.75rem; font-size: 0.875rem; padding: 0; transition: color 0.2s; }
                .bw-back-btn:hover { color: var(--primary); }
                .bw-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.25rem 0; }
                .bw-header p { color: var(--text-muted); font-size: 0.9375rem; margin: 0; }

                /* Buttons */
                .bw-btn-primary { display: flex; align-items: center; gap: 0.625rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark, #1d4ed8)); color: white; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; height: 42px; padding: 0 1.25rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
                .bw-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.4); }
                .bw-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .bw-btn-secondary { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; height: 42px; padding: 0 1.25rem; transition: all 0.2s; }
                .bw-btn-secondary:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .bw-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Empty */
                .bw-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; gap: 1.25rem; color: var(--text-dim); border: 2px dashed var(--border-color); border-radius: 1.25rem; text-align: center; }
                .bw-empty p { font-size: 1rem; margin: 0; }

                /* Grid */
                .bw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
                .bw-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
                .bw-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -6px rgba(0,0,0,0.15); }
                .bw-card-preview { height: 200px; position: relative; background: var(--bg-dark); }
                .bw-card-preview img { width: 100%; height: 100%; object-fit: cover; }
                .bw-card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; }
                .bw-card:hover .bw-card-overlay { opacity: 1; }
                .bw-remove-btn { background: #ef4444; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; }
                .bw-remove-btn:hover { background: #dc2626; transform: scale(1.1); }
                .bw-card-info { padding: 0.875rem 1rem; }
                .bw-card-info strong { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .bw-card-info span { font-size: 0.75rem; color: var(--text-muted); }

                /* Modal Backdrop */
                .bw-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; animation: bwFadeIn 0.25s ease; }
                @keyframes bwFadeIn { from { opacity: 0; } to { opacity: 1; } }

                /* Modal */
                .bw-modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.25rem; width: 100%; max-width: 520px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 25px 60px rgba(0,0,0,0.3); animation: bwSlideUp 0.3s cubic-bezier(0.16,1,0.3,1); overflow: hidden; }
                @keyframes bwSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* Modal Header */
                .bw-modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.5rem 1.75rem; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
                .bw-modal-header h2 { font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.25rem 0; }
                .bw-modal-header p { font-size: 0.8125rem; color: var(--text-muted); margin: 0; }
                .bw-modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.4rem; border-radius: 0.5rem; display: flex; transition: all 0.2s; }
                .bw-modal-close:hover { background: var(--bg-hover); color: var(--danger, #ef4444); }

                /* Filters */
                .bw-modal-filters { padding: 1rem 1.75rem; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem; flex-shrink: 0; background: var(--bg-hover); }
                .bw-search { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 0.5rem 0.875rem; transition: all 0.2s; }
                .bw-search:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                .bw-search input { border: none; background: none; outline: none; flex: 1; color: var(--text-main); font-size: 0.875rem; }
                .bw-filter-row { display: flex; gap: 0.75rem; }
                .bw-filter-row select { flex: 1; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 0.625rem; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.8125rem; outline: none; transition: border-color 0.2s; }
                .bw-filter-row select:focus { border-color: var(--primary); }

                /* Select All Bar */
                .bw-select-all-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 1.75rem; background: var(--bg-input); border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
                .bw-select-all-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: var(--text-muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; padding: 0; transition: color 0.2s; }
                .bw-select-all-btn:hover { color: var(--primary); }
                .bw-selected-count { font-size: 0.8125rem; font-weight: 600; color: var(--primary); background: rgba(59,130,246,0.12); padding: 0.2rem 0.6rem; border-radius: 999px; }

                /* List */
                .bw-modal-list { flex: 1; overflow-y: auto; padding: 0.75rem 1.25rem; display: flex; flex-direction: column; gap: 0.375rem; }
                .bw-list-item { display: flex; align-items: center; gap: 0.875rem; padding: 0.625rem 0.75rem; border-radius: 0.75rem; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; user-select: none; }
                .bw-list-item:hover { background: var(--bg-hover); border-color: var(--border-color); }
                .bw-list-item.selected { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.35); }

                .bw-checkbox { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
                .bw-checkbox.checked { background: var(--primary); border-color: var(--primary); color: white; }

                .bw-list-thumb { width: 44px; height: 44px; border-radius: 0.5rem; overflow: hidden; background: var(--bg-dark); flex-shrink: 0; }
                .bw-list-thumb img { width: 100%; height: 100%; object-fit: cover; }

                .bw-list-info { flex: 1; min-width: 0; }
                .bw-list-info strong { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .bw-list-info span { font-size: 0.75rem; color: var(--text-muted); }

                /* No Results */
                .bw-no-results { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--text-dim); text-align: center; }
                .bw-no-results p { font-size: 0.9rem; margin: 0; }

                /* Modal Footer */
                .bw-modal-footer { padding: 1.25rem 1.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0; background: var(--bg-card); }
                .bw-saving { font-size: 0.875rem; }
            `}</style>
        </div>
    );
};

export default BookWallpapers;
