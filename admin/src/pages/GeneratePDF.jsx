import { useState, useEffect } from 'react';
import { 
    FileText, 
    Search, 
    BookOpen, 
    Layers, 
    Palette, 
    CheckSquare, 
    Square, 
    Loader2, 
    RotateCcw,
    AlertCircle,
    Download
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import '../styles/pdf.css';

const GeneratePDF = () => {
    // Data lists
    const [wallpapers, setWallpapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selections
    const [selectedWpIds, setSelectedWpIds] = useState(new Set());
    const [selectedBookIds, setSelectedBookIds] = useState(new Set());
    const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());

    // Search and tab navigation
    const [activeTab, setActiveTab] = useState('wallpapers'); // wallpapers, books, groups, categories
    const [searchTerm, setSearchTerm] = useState('');
    
    // Customize PDF properties
    const [catalogTitle, setCatalogTitle] = useState('Stenna Wallpaper Catalog');
    const [catalogSubtitle, setCatalogSubtitle] = useState('Premium Artisan Collection');
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [wpRes, catRes, grpRes, bookRes] = await Promise.all([
                api.get('/wallpapers'),
                api.get('/categories'),
                api.get('/groups'),
                api.get('/books')
            ]);
            setWallpapers(wpRes.data || []);
            setCategories(catRes.data || []);
            setGroups(grpRes.data || []);
            setBooks(bookRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data for PDF builder', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper toggle functions
    const toggleWpSelection = (id) => {
        setSelectedWpIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleBookSelection = (id) => {
        setSelectedBookIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleGroupSelection = (id) => {
        setSelectedGroupIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleCategorySelection = (id) => {
        setSelectedCategoryIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const clearAllSelections = () => {
        setSelectedWpIds(new Set());
        setSelectedBookIds(new Set());
        setSelectedGroupIds(new Set());
        setSelectedCategoryIds(new Set());
        setSearchTerm('');
    };

    // ── The Union Resolver ──────────────────────────────
    // Resolve all wallpapers matching selected Books, Groups, Categories, or individual selections
    const getResolvedWallpapers = () => {
        return wallpapers.filter(w => {
            // 1. Direct Selection
            if (selectedWpIds.has(w.id)) return true;
            
            // 2. Book Selection
            if (selectedBookIds.size > 0 && w.books?.some(b => selectedBookIds.has(b.id))) return true;

            // 3. Group Selection
            if (selectedGroupIds.size > 0 && w.groups?.some(g => selectedGroupIds.has(g.id))) return true;

            // 4. Category Selection
            if (selectedCategoryIds.size > 0 && w.categories?.some(c => selectedCategoryIds.has(c.id))) return true;

            return false;
        });
    };

    const resolvedWallpapers = getResolvedWallpapers();

    // Trigger PDF generation API with real-time progress stream
    const handleGenerate = async () => {
        const resolvedWps = getResolvedWallpapers();
        if (resolvedWps.length === 0) {
            alert('Please select at least one wallpaper or collection to generate the catalog.');
            return;
        }

        const ids = resolvedWps.map(w => w.id);
        setGenerating(true);
        setProgress(0);
        setProgressMessage('Initializing request...');

        try {
            // Retrieve authorization token from local storage
            const tokenString = localStorage.getItem('token');
            let token = '';
            if (tokenString) {
                try {
                    token = JSON.parse(tokenString);
                } catch (e) {
                    token = tokenString;
                }
            }

            const baseURL = api.defaults.baseURL || 'http://localhost:5010/api/v1';
            
            // Call modern fetch streaming reader
            const response = await fetch(`${baseURL}/pdf/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    wallpaperIds: ids,
                    title: catalogTitle,
                    subtitle: catalogSubtitle
                })
            });

            if (!response.ok) {
                throw new Error(`Server returned error status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                
                // Retain incomplete last line in chunk buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.trim().substring(6));
                            
                            if (data.progress !== undefined) {
                                setProgress(data.progress);
                            }
                            if (data.message) {
                                setProgressMessage(data.message);
                            }

                            if (data.status === 'error') {
                                throw new Error(data.message || 'PDF Generation failed.');
                            }

                            if (data.status === 'completed' && data.token) {
                                setProgressMessage('Downloading catalog...');
                                
                                // Perform file download securely using the randomized token
                                const downloadUrl = `${baseURL}/pdf/download/${data.token}`;
                                const downloadLink = document.createElement('a');
                                downloadLink.href = downloadUrl;
                                downloadLink.setAttribute('download', '');
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                document.body.removeChild(downloadLink);
                            }
                        } catch (e) {
                            console.error('Error parsing stream chunk:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert(`PDF Generation Failed: ${error.message || 'An error occurred during PDF generation.'}`);
        } finally {
            setGenerating(false);
            setProgress(0);
            setProgressMessage('');
        }
    };

    // Filter lists by search query
    const getFilteredWallpapers = () => {
        return wallpapers.filter(w => 
            w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.design_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getFilteredBooks = () => {
        return books.filter(b => 
            b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getFilteredGroups = () => {
        return groups.filter(g => 
            g.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getFilteredCategories = () => {
        return categories.filter(c => 
            c.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    if (loading) {
        return (
            <div className="pdf-builder-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Loader message="Loading Collections Builder..." />
            </div>
        );
    }

    return (
        <div className="pdf-builder-page">
            {/* Header */}
            <header className="pdf-builder-header">
                <h1>Generate PDF Catalog</h1>
                <p>Curate custom catalogs by selecting individual wallpapers, sample books, collection groups, or product categories.</p>
            </header>

            {/* Tab Navigation */}
            <nav className="pdf-builder-tabs">
                <button 
                    className={`pdf-tab-btn ${activeTab === 'wallpapers' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('wallpapers'); setSearchTerm(''); }}
                >
                    <Palette size={16} />
                    <span>Wallpapers ({wallpapers.length})</span>
                </button>
                <button 
                    className={`pdf-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('books'); setSearchTerm(''); }}
                >
                    <BookOpen size={16} />
                    <span>Sample Books ({books.length})</span>
                </button>
                <button 
                    className={`pdf-tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('groups'); setSearchTerm(''); }}
                >
                    <Layers size={16} />
                    <span>Collection Groups ({groups.length})</span>
                </button>
                <button 
                    className={`pdf-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
                >
                    <Layers size={16} />
                    <span>Product Categories ({categories.length})</span>
                </button>
            </nav>

            {/* Control Bar */}
            <div className="pdf-control-bar">
                <div className="pdf-search-box">
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {(selectedWpIds.size > 0 || selectedBookIds.size > 0 || selectedGroupIds.size > 0 || selectedCategoryIds.size > 0) && (
                    <button className="pdf-clear-btn" onClick={clearAllSelections}>
                        <RotateCcw size={14} />
                        <span>Reset Selections</span>
                    </button>
                )}
            </div>

            {/* Active selector layouts */}
            <div className="selector-grid">
                
                {/* 1. WALLPAPERS TAB */}
                {activeTab === 'wallpapers' && (
                    getFilteredWallpapers().length === 0 ? (
                        <div className="pdf-empty-state">
                            <AlertCircle size={32} />
                            <h3>No wallpapers match your search</h3>
                            <p>Try refining your search keyword.</p>
                        </div>
                    ) : (
                        getFilteredWallpapers().map(w => {
                            const isSelected = selectedWpIds.has(w.id);
                            // Get Hand Image (index 0) or fallback
                            const handImg = w.images?.[0]?.image_url || 'https://placehold.co/52x52/1e293b/94a3b8?text=?';
                            return (
                                <div 
                                    key={w.id} 
                                    className={`selector-card wp-selector-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleWpSelection(w.id)}
                                >
                                    <div className="wp-card-thumb">
                                        <img src={handImg} alt={w.name} />
                                    </div>
                                    <div className="wp-card-details">
                                        <span className="wp-card-code">{w.design_code || 'UNTITLED'}</span>
                                        <span className="wp-card-name">{w.name}</span>
                                        <span className="wp-card-spec">₹{w.price ? parseFloat(w.price).toLocaleString('en-IN') : '0.00'}</span>
                                    </div>
                                    <div className="card-checked-indicator">
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                </div>
                            );
                        })
                    )
                )}

                {/* 2. SAMPLE BOOKS TAB */}
                {activeTab === 'books' && (
                    getFilteredBooks().length === 0 ? (
                        <div className="pdf-empty-state">
                            <AlertCircle size={32} />
                            <h3>No books match your search</h3>
                            <p>Try refining your search keyword.</p>
                        </div>
                    ) : (
                        getFilteredBooks().map(b => {
                            const isSelected = selectedBookIds.has(b.id);
                            // Count how many wallpapers belong to this book
                            const wpCount = wallpapers.filter(w => w.books?.some(wb => wb.id === b.id)).length;
                            return (
                                <div 
                                    key={b.id} 
                                    className={`selector-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleBookSelection(b.id)}
                                >
                                    <div className="coll-card-icon book-icon">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="coll-card-details">
                                        <span className="coll-card-name">{b.name}</span>
                                        <span className="coll-card-count">{wpCount} Wallpapers</span>
                                    </div>
                                    <div className="card-checked-indicator">
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                </div>
                            );
                        })
                    )
                )}

                {/* 3. COLLECTION GROUPS TAB */}
                {activeTab === 'groups' && (
                    getFilteredGroups().length === 0 ? (
                        <div className="pdf-empty-state">
                            <AlertCircle size={32} />
                            <h3>No groups match your search</h3>
                            <p>Try refining your search keyword.</p>
                        </div>
                    ) : (
                        getFilteredGroups().map(g => {
                            const isSelected = selectedGroupIds.has(g.id);
                            const wpCount = wallpapers.filter(w => w.groups?.some(wg => wg.id === g.id)).length;
                            return (
                                <div 
                                    key={g.id} 
                                    className={`selector-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleGroupSelection(g.id)}
                                >
                                    <div className="coll-card-icon group-icon">
                                        <Layers size={20} />
                                    </div>
                                    <div className="coll-card-details">
                                        <span className="coll-card-name">{g.name}</span>
                                        <span className="coll-card-count">{wpCount} Wallpapers</span>
                                    </div>
                                    <div className="card-checked-indicator">
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                </div>
                            );
                        })
                    )
                )}

                {/* 4. PRODUCT CATEGORIES TAB */}
                {activeTab === 'categories' && (
                    getFilteredCategories().length === 0 ? (
                        <div className="pdf-empty-state">
                            <AlertCircle size={32} />
                            <h3>No categories match your search</h3>
                            <p>Try refining your search keyword.</p>
                        </div>
                    ) : (
                        // Group categories under parent Collection Group headers
                        groups.map(group => {
                            const groupCats = getFilteredCategories().filter(c => c.group_id === group.id);
                            if (groupCats.length === 0) return null;

                            return (
                                <div key={group.id} style={{ display: 'contents' }}>
                                    <h3 className="category-group-header">{group.name} Collection</h3>
                                    {groupCats.map(c => {
                                        const isSelected = selectedCategoryIds.has(c.id);
                                        const wpCount = wallpapers.filter(w => w.categories?.some(wc => wc.id === c.id)).length;
                                        return (
                                            <div 
                                                key={c.id} 
                                                className={`selector-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleCategorySelection(c.id)}
                                            >
                                                <div className="coll-card-icon category-icon">
                                                    <Layers size={20} />
                                                </div>
                                                <div className="coll-card-details">
                                                    <span className="coll-card-name">{c.name}</span>
                                                    <span className="coll-card-count">{wpCount} Wallpapers</span>
                                                </div>
                                                <div className="card-checked-indicator">
                                                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )
                )}
            </div>

            {/* Bottom Drawer Summary / Action Panel */}
            <div className="pdf-builder-drawer">
                <div className="pdf-drawer-meta">
                    <div className="pdf-meta-inputs">
                        <div className="pdf-meta-field">
                            <label>Catalog Title</label>
                            <input 
                                type="text" 
                                value={catalogTitle} 
                                onChange={(e) => setCatalogTitle(e.target.value)} 
                                placeholder="Catalog Title"
                                disabled={generating}
                            />
                        </div>
                        <div className="pdf-meta-field">
                            <label>Subtitle / Season</label>
                            <input 
                                type="text" 
                                value={catalogSubtitle} 
                                onChange={(e) => setCatalogSubtitle(e.target.value)} 
                                placeholder="Subtitle / Edition"
                                disabled={generating}
                            />
                        </div>
                    </div>
                </div>

                <div className="pdf-drawer-stats">
                    <div className="pdf-stat-item">
                        <span>{resolvedWallpapers.length}</span>
                        <span>Wallpapers Selected</span>
                    </div>
                </div>

                <div className="pdf-drawer-actions">
                    <button 
                        className="pdf-btn-primary" 
                        onClick={handleGenerate}
                        disabled={resolvedWallpapers.length === 0 || generating}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="pdf-spin" size={16} />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                <span>Download PDF Catalog</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Real-time Streaming Generation Progress Modal */}
            {generating && (
                <div className="pdf-generation-overlay">
                    <div className="pdf-progress-modal">
                        <div className="pdf-progress-monogram">S</div>
                        <h2>Compiling Luxury Catalog</h2>
                        <p className="pdf-progress-subtitle">Please wait while the server compiles your custom catalog.</p>
                        
                        <div className="pdf-progress-bar-container">
                            <div 
                                className="pdf-progress-bar-fill" 
                                style={{ width: `${progress}%` }}
                            ></div>
                            <span className="pdf-progress-percentage">{progress}%</span>
                        </div>
                        
                        <div className="pdf-progress-message">
                            <Loader2 className="pdf-spin" size={16} />
                            <span>{progressMessage}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneratePDF;
