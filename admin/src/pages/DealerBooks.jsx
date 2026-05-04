import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Book,
    Search
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const DealerBooks = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dealer, setDealer] = useState(null);
    const [assignedBooks, setAssignedBooks] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
        fetchAvailableBooks();
    }, [id]);

    const fetchData = async () => {
        try {
            const [dealerRes, booksRes] = await Promise.all([
                api.get(`/dealers/${id}`),
                api.get(`/dealers/${id}/books`)
            ]);
            setDealer(dealerRes.data);
            setAssignedBooks(booksRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            alert('Failed to load dealer data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableBooks = async () => {
        try {
            const res = await api.get('/books');
            setAvailableBooks(res.data);
        } catch (error) {
            console.error('Failed to fetch available books', error);
        }
    };

    const handleAssign = async (bookId) => {
        try {
            await api.post(`/dealers/${id}/books`, { bookId });
            // Refresh assigned list
            const res = await api.get(`/dealers/${id}/books`);
            setAssignedBooks(res.data);
            setIsAssignModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to assign book');
        }
    };

    const handleRemove = async (bookId) => {
        if (window.confirm('Are you sure you want to remove this book from the dealer?')) {
            try {
                await api.delete(`/dealers/${id}/books/${bookId}`);
                setAssignedBooks(assignedBooks.filter(b => b.id !== bookId));
            } catch (error) {
                alert('Failed to remove book');
            }
        }
    };

    // Filter available books to exclude already assigned ones
    const unassignedBooks = availableBooks.filter(book =>
        !assignedBooks.some(ab => ab.id === book.id) &&
        (book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="page-container"><Loader message="Loading dealer books..." /></div>;
    if (!dealer) return <div className="page-container">Dealer not found</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <button className="back-btn" onClick={() => navigate('/dealers')}>
                        <ArrowLeft size={20} />
                        <span>Back to Dealers</span>
                    </button>
                    <h1>{dealer.name}'s Books</h1>
                    <p>Manage book access for {dealer.email}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAssignModalOpen(true)}>
                    <Plus size={20} />
                    <span>Assign Book</span>
                </button>
            </header>

            <div className="books-grid">
                {assignedBooks.length === 0 ? (
                    <div className="empty-state">
                        <Book size={48} />
                        <p>No books assigned to this dealer yet.</p>
                        <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(true)}>
                            Assign First Book
                        </button>
                    </div>
                ) : (
                    assignedBooks.map(book => (
                        <div key={book.id} className="book-card">
                            <div className="book-cover">
                                {book.image_url ? (
                                    <img src={book.image_url} alt={book.name} />
                                ) : (
                                    <div className="placeholder"><Book size={32} /></div>
                                )}
                            </div>
                            <div className="book-info">
                                <h3>{book.name}</h3>
                                <div className="book-meta">
                                    <span>{book.code}</span>
                                    <span className={`status-dot ${book.is_active ? 'active' : ''}`}></span>
                                </div>
                                <button className="remove-btn" onClick={() => handleRemove(book.id)}>
                                    <Trash2 size={16} />
                                    <span>Remove Access</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isAssignModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Assign Book</h2>
                            <button className="close-btn" onClick={() => setIsAssignModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search available books..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="book-list">
                                {unassignedBooks.length === 0 ? (
                                    <p className="no-results">No matching books found or all books assigned.</p>
                                ) : (
                                    unassignedBooks.map(book => (
                                        <div key={book.id} className="book-list-item">
                                            <div className="book-item-info">
                                                <strong>{book.name}</strong>
                                                <span>{book.code}</span>
                                            </div>
                                            <button className="btn-sm btn-primary" onClick={() => handleAssign(book.id)}>
                                                Assign
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .back-btn { background: none; border: none; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); cursor: pointer; margin-bottom: 1rem; font-size: 0.875rem; padding: 0; }
                .back-btn:hover { color: var(--primary); }
                .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .page-header p { color: var(--text-muted); font-size: 0.9375rem; }
                
                .btn { display: flex; align-items: center; gap: 0.625rem; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; height: 42px; padding: 0 1.25rem; }
                .btn-primary { background: var(--primary); color: white; }
                .btn-secondary { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); }
                
                .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
                .book-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
                .book-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
                
                .book-cover { height: 160px; background: var(--bg-dark); display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .book-cover img { width: 100%; height: 100%; object-fit: cover; }
                .placeholder { color: var(--text-dim); }
                
                .book-info { padding: 1rem; }
                .book-info h3 { font-size: 1rem; font-weight: 600; color: var(--text-main); margin: 0 0 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .book-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .book-meta span { font-size: 0.75rem; color: var(--text-muted); }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
                .status-dot.active { background: #10b981; }
                
                .remove-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.8125rem; cursor: pointer; transition: all 0.2s; }
                .remove-btn:hover { background: #ef4444; color: white; }
                
                .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center; color: var(--text-dim); gap: 1rem; border: 2px dashed var(--border-color); border-radius: 1rem; }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: var(--bg-card); border-radius: 1rem; border: 1px solid var(--border-color); width: 100%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; }
                .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
                .modal-header h2 { margin: 0; font-size: 1.25rem; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
                
                .modal-body { padding: 1.5rem; overflow-y: auto; }
                .search-box { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-input); padding: 0.5rem 1rem; border-radius: 0.75rem; margin-bottom: 1rem; border: 1px solid var(--border-color); }
                .search-box input { border: none; background: none; outline: none; width: 100%; color: var(--text-main); }
                
                .book-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .book-list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-radius: 0.5rem; background: var(--bg-input); border: 1px solid transparent; }
                .book-list-item:hover { border-color: var(--primary); }
                .book-item-info { display: flex; flex-direction: column; }
                .book-item-info strong { font-size: 0.9375rem; color: var(--text-main); }
                .book-item-info span { font-size: 0.75rem; color: var(--text-muted); }
                
                .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.75rem; height: 28px; border-radius: 0.25rem; }
                .no-results { text-align: center; color: var(--text-muted); font-size: 0.875rem; padding: 1rem; }
            `}</style>
        </div>
    );
};

export default DealerBooks;
