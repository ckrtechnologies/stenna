import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Book,
    Image,
    Eye,
    BookOpen,
    Filter,
    Download,
    RotateCcw
} from 'lucide-react';
import api from '../utils/api';
import BookModal from '../components/BookModal';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ is_active: 'all' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch (error) {
            console.error('Failed to fetch books', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentBook(null);
        setIsModalOpen(true);
    };

    const handleEdit = (book) => {
        setCurrentBook(book);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await api.delete(`/books/${id}`);
                setBooks(books.filter(b => b.id !== id));
            } catch (error) {
                alert('Failed to delete book');
            }
        }
    };

    const handleManageWallpapers = (book) => {
        navigate(`/books/${book.id}/wallpapers`);
    };

    const handleSave = async (data) => {
        try {
            if (currentBook) {
                await api.put(`/books/${currentBook.id}`, data);
            } else {
                await api.post('/books', data);
            }
            fetchBooks();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save book');
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

    const filteredBooks = books.filter(b => {
        const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filters.is_active === 'all' ||
            (filters.is_active === 'active' ? b.is_active : !b.is_active);

        return matchesSearch && matchesStatus;
    });

    const downloadCSV = () => {
        if (filteredBooks.length === 0) return;

        const headers = ['Name', 'Code', 'Description', 'Status', 'Created Date'];
        const rows = filteredBooks.map(b => [
            `"${b.name || ''}"`,
            `"${b.code || ''}"`,
            `"${b.description || ''}"`,
            b.is_active ? 'Active' : 'Hidden',
            `"${b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `books_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="books-page">
            <header className="page-header">
                <div>
                    <h1>Books</h1>
                    <p>Manage your catalogue books.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    <span>Add New Book</span>
                </button>
            </header>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search books..."
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
                                <option value="inactive">Hidden Only</option>
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
                            <th>Cover</th>
                            <th>Name / Code</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Wallpapers</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5"><Loader message="Fetching books..." /></td></tr>
                        ) : filteredBooks.length === 0 ? (
                            <tr><td colSpan="5" className="empty">No books found.</td></tr>
                        ) : (
                            filteredBooks.map(book => (
                                <tr key={book.id}>
                                    <td>
                                        <div className="img-preview-box">
                                            {book.image_url ? (
                                                <img src={book.image_url} alt={book.name} />
                                            ) : (
                                                <div className="placeholder"><Book size={20} /></div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="name-cell">
                                            <strong>{book.name}</strong>
                                            <span>{book.code}</span>
                                        </div>
                                    </td>
                                    <td className="desc-cell">{book.description || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${book.is_active ? 'active' : 'inactive'}`}>
                                            {book.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon-text" onClick={() => handleManageWallpapers(book)}>
                                            <Image size={16} />
                                            <span>Manage</span>
                                        </button>
                                    </td>
                                    <td className="actions">
                                        <button className="icon-btn" title="Edit" onClick={() => handleEdit(book)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="icon-btn red" title="Delete" onClick={() => handleDelete(book.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <BookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                book={currentBook}
            />

            <style jsx>{`
                .page-container { padding: 2rem; max-width: 100%; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.025em; }
                .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
                
                .btn { display: flex; align-items: center; gap: 0.625rem; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); height: 42px; padding: 0 1.25rem; }
                .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
                .btn-secondary { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); }
                .btn-secondary:hover { background: var(--bg-hover); border-color: var(--primary); color: var(--primary); }
                
                .table-controls { display: flex; justify-content: space-between; margin-bottom: 1.5rem; background: var(--bg-card); padding: 0.75rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .search-box { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-input); padding: 0.5rem 1rem; border-radius: 0.75rem; flex: 1; max-width: 400px; border: 1px solid transparent; transition: all 0.2s; }
                .search-box:focus-within { border-color: var(--primary); background: var(--bg-card); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                .search-box input { border: none; background: none; outline: none; width: 100%; color: var(--text-main); font-size: 0.875rem; }

                .control-buttons { display: flex; gap: 0.75rem; }
                .filter-panel { margin-bottom: 2rem; padding: 1.5rem; border-radius: 1rem; background: var(--bg-input); border: 1px solid var(--border-color); animation: slideDown 0.3s ease-out; }
                .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; align-items: flex-end; }
                .filter-field { display: flex; flex-direction: column; gap: 0.5rem; }
                .filter-field label { font-size: 0.75rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
                .filter-field select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.6rem; color: var(--text-main); font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
                .filter-field select:focus { border-color: var(--primary); }
                .filter-actions { display: flex; justify-content: flex-end; }
                .btn-text { background: none; border: none; color: var(--text-muted); font-size: 0.8125rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .btn-text:hover { color: var(--primary); background: rgba(59, 130, 246, 0.1); }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .table-container { background: var(--bg-card); border-radius: 1rem; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                table { width: 100%; border-collapse: separate; border-spacing: 0; }
                th { background: var(--bg-header-bar); padding: 1rem 1.5rem; text-align: left; color: var(--text-dim); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
                td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-main); font-size: 0.875rem; vertical-align: middle; }
                tr:last-child td { border-bottom: none; }
                tr:hover td { background: var(--bg-hover); }

                .img-preview-box { width: 44px; height: 44px; border-radius: 8px; overflow: hidden; background: var(--bg-input); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
                .img-preview-box img { width: 100%; height: 100%; object-fit: cover; }
                .placeholder { background: var(--bg-dark); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

                .name-cell { display: flex; flex-direction: column; }
                .name-cell strong { color: var(--text-main); font-size: 0.9375rem; }
                .name-cell span { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.125rem; }

                .desc-cell { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted); font-size: 0.8125rem; }

                .status-badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
                .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-badge.inactive { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                .btn-icon-text { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 0.5rem; color: var(--text-muted); cursor: pointer; font-size: 0.8125rem; transition: all 0.2s; }
                .btn-icon-text:hover { border-color: var(--primary); color: var(--primary); }

                .actions { display: flex; gap: 0.5rem; }
                .icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 0.5rem; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .icon-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--bg-card); }
                .icon-btn.red:hover { border-color: #ef4444; color: #ef4444; }
                
                .empty { text-align: center; padding: 4rem; color: var(--text-dim); font-style: italic; }
            `}</style>
        </div>
    );
};

export default Books;
