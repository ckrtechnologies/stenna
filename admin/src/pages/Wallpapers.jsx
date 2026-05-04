import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Download,
    Upload,
    RotateCcw,
    CheckSquare,
    Square,
    BookOpen,
    ToggleLeft,
    ChevronDown,
    X
} from 'lucide-react';
import api from '../utils/api';
import WallpaperModal from '../components/WallpaperModal';
import BulkUploadModal from '../components/BulkUploadModal';
import Loader from '../components/Loader';

const DropdownMultiSelect = ({ label, options, selectedValues, onToggleItem, onApply, isBulk = false, isOpen, onToggleDropdown }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onToggleDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggleDropdown]);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <button 
                className={`dropdown-trigger ${selectedValues.length > 0 ? 'active' : ''}`} 
                onClick={() => onToggleDropdown(isOpen ? null : label)}
            >
                <span>{selectedValues.length > 0 ? `${label} (${selectedValues.length})` : label}</span>
                <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-options">
                        {options.map(opt => (
                            <label key={opt.id} className="dropdown-option">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(opt.id)}
                                    onChange={() => onToggleItem(opt.id)}
                                />
                                <span>{opt.name}</span>
                                {opt.code && <span className="opt-code">{opt.code}</span>}
                            </label>
                        ))}
                    </div>
{isBulk && onApply && (
    <div className="dropdown-footer">
        <button className="apply-btn" onClick={(e) => { e.stopPropagation(); onApply(); }}>Apply</button>
    </div>
)}
                </div>
            )}
        </div>
    );
};

const PriceRangeSelector = ({ min, max, value, onChange, isOpen, onToggleDropdown }) => {
    const dropdownRef = useRef(null);
    const [localMin, setLocalMin] = useState(value[0]);
    const [localMax, setLocalMax] = useState(value[1]);

    useEffect(() => {
        setLocalMin(value[0]);
        setLocalMax(value[1]);
    }, [value]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onToggleDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggleDropdown]);

    const handleMinChange = (e) => {
        const val = Number(e.target.value);
        setLocalMin(val);
    };

    const handleMaxChange = (e) => {
        const val = Number(e.target.value);
        setLocalMax(val);
    };

    const handleApply = () => {
        let finalMin = Number(localMin);
        let finalMax = Number(localMax);

        // Ensure numeric and within bounds
        if (isNaN(finalMin)) finalMin = min;
        if (isNaN(finalMax)) finalMax = max;

        // Logical enforcement
        if (finalMin >= finalMax) {
            finalMin = finalMax - 1;
        }

        // Global bounds
        finalMin = Math.max(min, Math.min(finalMin, max - 1));
        finalMax = Math.min(max, Math.max(finalMax, min + 1));

        onChange([finalMin, finalMax]);
        onToggleDropdown(null);
    };

    const handleReset = (e) => {
        e.stopPropagation();
        onChange([min, max], false);
        onToggleDropdown(null);
    };

    const minPos = ((localMin - min) / (max - min)) * 100;
    const maxPos = ((localMax - min) / (max - min)) * 100;

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <button 
                className={`dropdown-trigger ${value[0] !== min || value[1] !== max ? 'active' : ''}`} 
                onClick={() => onToggleDropdown(isOpen ? null : 'Prices')}
            >
                <span>
                    {value[0] === min && value[1] === max 
                        ? 'Prices' 
                        : `₹${value[0]} - ₹${value[1]}`}
                </span>
                <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {isOpen && (
                <div className="dropdown-menu price-slider-menu">
                    <div className="price-slider-content">
                        <div className="price-slider-header">
                            <span className="price-label">Price Range</span>
                            <button className="price-reset-link" onClick={handleReset}>Reset</button>
                        </div>
                        
                        <div className="slider-container">
                            <div className="slider-track"></div>
                            <div 
                                className="slider-range" 
                                style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                            ></div>
                            <input
                                type="range"
                                min={min}
                                max={max}
                                value={localMin}
                                onChange={handleMinChange}
                                className="thumb thumb-left"
                            />
                            <input
                                type="range"
                                min={min}
                                max={max}
                                value={localMax}
                                onChange={handleMaxChange}
                                className="thumb thumb-right"
                            />
                        </div>

                        <div className="price-inputs">
                            <div className="price-input-group">
                                <label>Min</label>
                                <div className="input-with-symbol">
                                    <span>₹</span>
                                    <input 
                                        type="number" 
                                        value={localMin} 
                                        onChange={handleMinChange}
                                    />
                                </div>
                            </div>
                            <div className="price-input-group">
                                <label>Max</label>
                                <div className="input-with-symbol">
                                    <span>₹</span>
                                    <input 
                                        type="number" 
                                        value={localMax} 
                                        onChange={handleMaxChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-footer">
                        <button className="apply-btn" onClick={handleApply}>Apply Filter</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Wallpapers = () => {
    const [wallpapers, setWallpapers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [currentWallpaper, setCurrentWallpaper] = useState(null);

    // Selection state
    const [selectedIds, setSelectedIds] = useState(new Set());

    // UI state
    const [activeDropdown, setActiveDropdown] = useState(null); // 'Groups', 'Categories', etc.
    const [bulkLoading, setBulkLoading] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        group_ids: [],
        category_ids: [],
        book_ids: [],
        price_range: [0, 50000], // [min, max]
        price_range_active: false,
        is_active: 'all'
    });

    const [pendingBulkIds, setPendingBulkIds] = useState(new Set());

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // Fetch logic
    useEffect(() => {
        fetchWallpapers();
        fetchCategories();
        fetchGroups();
        fetchBooks();
    }, []);

    const fetchGroups = async () => {
        try { const res = await api.get('/groups'); setGroups(res.data); }
        catch { /* silent */ }
    };
    const fetchWallpapers = async () => {
        try {
            const res = await api.get('/wallpapers');
            setWallpapers(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };
    const fetchCategories = async () => {
        try { const res = await api.get('/categories'); setCategories(res.data); }
        catch { /* silent */ }
    };
    const fetchBooks = async () => {
        try { const res = await api.get('/books'); setBooks(res.data); }
        catch { /* silent */ }
    };

    // ── Selection helpers ──────────────────────────────
    const toggleRow = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedWallpapers.length && paginatedWallpapers.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedWallpapers.map(w => w.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    // ── Bulk actions ───────────────────────────────────
    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.size} wallpaper(s)?`)) return;
        setBulkLoading(true);
        try {
            await Promise.all([...selectedIds].map(id => api.delete(`/wallpapers/${id}`)));
            setWallpapers(prev => prev.filter(w => !selectedIds.has(w.id)));
            clearSelection();
        } catch { alert('Some deletions failed'); }
        finally { setBulkLoading(false); }
    };

    const handleBulkStatus = async (status) => {
        setBulkLoading(true);
        try {
            await Promise.all([...selectedIds].map(id =>
                api.patch(`/wallpapers/${id}/status`, { is_active: status })
            ));
            setWallpapers(prev => prev.map(w =>
                selectedIds.has(w.id) ? { ...w, is_active: status } : w
            ));
            await fetchWallpapers();
            clearSelection();
            setActiveDropdown(null);
        } catch { alert('Status update failed'); }
        finally { setBulkLoading(false); }
    };

    const handleBulkAssignGroup = async (e) => {
        if (e) e.stopPropagation();
        const groupIds = Array.from(pendingBulkIds);
        if (groupIds.length === 0) return alert('Select at least one group');
        setBulkLoading(true);
        try {
            await api.post('/groups/wallpapers/bulk', {
                wallpaperIds: [...selectedIds],
                groupIds
            });
            alert(`${selectedIds.size} wallpaper(s) assigned to ${groupIds.length} group(s).`);
            await fetchWallpapers();
            setPendingBulkIds(new Set());
            setActiveDropdown(null);
            clearSelection();
        } catch (err) {
            alert(err.response?.data?.message || 'Group assignment failed');
        } finally { setBulkLoading(false); }
    };

    const handleBulkAssignCategory = async (e) => {
        if (e) e.stopPropagation();
        const categoryIds = Array.from(pendingBulkIds);
        if (categoryIds.length === 0) return alert('Select at least one category');
        setBulkLoading(true);
        try {
            await api.post('/categories/wallpapers/bulk', {
                wallpaperIds: [...selectedIds],
                categoryIds
            });
            alert(`${selectedIds.size} wallpaper(s) assigned to ${categoryIds.length} category(ies).`);
            await fetchWallpapers();
            setPendingBulkIds(new Set());
            setActiveDropdown(null);
            clearSelection();
        } catch (err) {
            alert(err.response?.data?.message || 'Category assignment failed');
        } finally { setBulkLoading(false); }
    };

    const handleBulkAssignBook = async (e) => {
        if (e) e.stopPropagation();
        const bookIds = Array.from(pendingBulkIds);
        if (bookIds.length === 0) return alert('Select at least one book');
        setBulkLoading(true);
        try {
            await api.post('/books/wallpapers/bulk', {
                wallpaperIds: [...selectedIds],
                bookIds
            });
            alert(`${selectedIds.size} wallpaper(s) assigned to ${bookIds.length} book(s).`);
            await fetchWallpapers();
            setPendingBulkIds(new Set());
            setActiveDropdown(null);
            clearSelection();
        } catch (err) {
            alert(err.response?.data?.message || 'Book assignment failed');
        } finally { setBulkLoading(false); }
    };

    const togglePendingBulkId = (id) => {
        setPendingBulkIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Individual actions ─────────────────────────────
    const handleAdd = () => { setCurrentWallpaper(null); setIsModalOpen(true); };
    const handleEdit = (w) => { setCurrentWallpaper(w); setIsModalOpen(true); };
    const handleDelete = async (id) => {
        if (window.confirm('Delete this wallpaper?')) {
            try {
                await api.delete(`/wallpapers/${id}`);
                setWallpapers(prev => prev.filter(w => w.id !== id));
            } catch { alert('Failed to delete wallpaper'); }
        }
    };
    const handleSave = async (data) => {
        try {
            if (currentWallpaper) {
                await api.put(`/wallpapers/${currentWallpaper.id}`, data);
            } else {
                await api.post('/wallpapers', data);
            }
            fetchWallpapers();
            setIsModalOpen(false);
        } catch { alert('Failed to save wallpaper'); }
    };
    const handleView = (w) => {
        const url = w.images?.[0]?.image_url;
        if (url) window.open(url, '_blank');
        else alert('No image available.');
    };

    // ── Filter logic ───────────────────────────────────
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
        clearSelection();
    };
    const clearFilters = () => {
        setFilters({ 
            group_ids: [], 
            category_ids: [], 
            book_ids: [],
            price_range: [0, 50000],
            price_range_active: false,
            is_active: 'all' 
        });
        setSearchTerm('');
        setCurrentPage(1);
        clearSelection();
    };

    const filteredWallpapers = wallpapers.filter(w => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = !q || w.name?.toLowerCase().includes(q) ||
            w.slug?.toLowerCase().includes(q) ||
            w.design_code?.toLowerCase().includes(q);
        
        const matchesGroup = filters.group_ids.length === 0 || 
            w.groups?.some(g => filters.group_ids.includes(g.id));
        
        const matchesCategory = filters.category_ids.length === 0 || 
            w.categories?.some(c => filters.category_ids.includes(c.id));
        
        const matchesBook = filters.book_ids.length === 0 || 
            w.books?.some(b => filters.book_ids.includes(b.id));
        
        let matchesPrice = true;
        if (filters.price_range_active) {
            const price = parseFloat(w.price) || 0;
            matchesPrice = price >= filters.price_range[0] && price <= filters.price_range[1];
        }

        const matchesStatus = filters.is_active === 'all' ||
            (filters.is_active === 'active' ? w.is_active : !w.is_active);
            
        return matchesSearch && matchesGroup && matchesCategory && matchesBook && matchesPrice && matchesStatus;
    });

    const paginatedWallpapers = filteredWallpapers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredWallpapers.length / itemsPerPage);

    const allPageSelected = paginatedWallpapers.length > 0 &&
        paginatedWallpapers.every(w => selectedIds.has(w.id));
    const somePageSelected = paginatedWallpapers.some(w => selectedIds.has(w.id));



    // Export CSV
    const downloadCSV = () => {
        const source = selectedIds.size > 0
            ? filteredWallpapers.filter(w => selectedIds.has(w.id))
            : filteredWallpapers;
        if (!source.length) return;
        const headers = ['Name','Design Code','Slug','Description','Price','Roll Width','Roll Height',
            'Stock','Material','Finish','Washability','Durability','Brand','Country','Is Active',
            'Category Names','Group Names'];
        const rows = source.map(w => [
            `"${w.name}"`, `"${w.design_code||''}"`, `"${w.slug||''}"`,
            `"${(w.description||'').replace(/"/g,'""')}"`, w.price||0,
            w.roll_width||'', w.roll_height||'', w.quantity||0,
            `"${w.material||''}"`, `"${w.finish||''}"`, `"${w.washability||''}"`,
            `"${w.durability||''}"`, `"${w.brand||''}"`, `"${w.country||''}"`,
            w.is_active?'TRUE':'FALSE',
            `"${w.categories?.map(c=>c.name).join(', ')||''}"`,
            `"${w.groups?.map(g=>g.name).join(', ')||''}"`
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv], {type:'text/csv'})),
            download: `wallpapers_${new Date().toISOString().split('T')[0]}.csv`
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    // ── Active filter count badge ──────────────────────
    const activeFilterCount = (
        filters.group_ids.length + 
        filters.category_ids.length + 
        filters.book_ids.length + 
        (filters.price_range_active ? 1 : 0) +
        (filters.is_active !== 'all' ? 1 : 0)
    );

    return (
        <div className="wp-page">

            {/* ══ Page Header ══════════════════════════════════════ */}
            <header className="wp-header">
                <div>
                    <h1>Wallpapers</h1>
                    <p>Manage your collection of <strong>{filteredWallpapers.length}</strong> wallpapers.</p>
                </div>
                <div className="wp-header-actions">
                    <button className="wp-btn-secondary" onClick={() => setIsBulkModalOpen(true)}>
                        <Upload size={17} /><span>Bulk Upload</span>
                    </button>
                    <button className="wp-btn-secondary" onClick={downloadCSV}>
                        <Download size={17} />
                        <span>{selectedIds.size > 0 ? `Export (${selectedIds.size})` : 'Export CSV'}</span>
                    </button>
                    <button className="wp-btn-primary" onClick={handleAdd}>
                        <Plus size={18} /><span>Add New</span>
                    </button>
                </div>
            </header>

            {/* ══ Search + Inline Filters ══════════════════════════ */}
            <div className="wp-filter-bar">
                {/* Search */}
                <div className="wp-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, code, slug..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    {searchTerm && (
                        <button className="wp-clear-search" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filters row */}
                <div className="wp-filters">
                    <DropdownMultiSelect
                        label="Groups"
                        options={groups}
                        selectedValues={filters.group_ids}
                        isOpen={activeDropdown === 'Groups'}
                        onToggleDropdown={setActiveDropdown}
                        onToggleItem={(id) => {
                            setFilters(prev => ({
                                ...prev,
                                group_ids: prev.group_ids.includes(id) 
                                    ? prev.group_ids.filter(x => x !== id) 
                                    : [...prev.group_ids, id]
                            }));
                            setCurrentPage(1);
                        }}
                    />

                    <DropdownMultiSelect
                        label="Categories"
                        options={categories.filter(c => 
                            filters.group_ids.length === 0 || filters.group_ids.includes(c.group_id)
                        )}
                        selectedValues={filters.category_ids}
                        isOpen={activeDropdown === 'Categories'}
                        onToggleDropdown={setActiveDropdown}
                        onToggleItem={(id) => {
                            setFilters(prev => ({
                                ...prev,
                                category_ids: prev.category_ids.includes(id) 
                                    ? prev.category_ids.filter(x => x !== id) 
                                    : [...prev.category_ids, id]
                            }));
                            setCurrentPage(1);
                        }}
                    />

                    <DropdownMultiSelect
                        label="Books"
                        options={books}
                        selectedValues={filters.book_ids}
                        isOpen={activeDropdown === 'Books'}
                        onToggleDropdown={setActiveDropdown}
                        onToggleItem={(id) => {
                            setFilters(prev => ({
                                ...prev,
                                book_ids: prev.book_ids.includes(id) 
                                    ? prev.book_ids.filter(x => x !== id) 
                                    : [...prev.book_ids, id]
                            }));
                            setCurrentPage(1);
                        }}
                    />

                    <PriceRangeSelector
                        min={0}
                        max={50000}
                        value={filters.price_range}
                        isOpen={activeDropdown === 'Prices'}
                        onToggleDropdown={setActiveDropdown}
                        onChange={(range, active = true) => {
                            setFilters(prev => ({
                                ...prev,
                                price_range: range,
                                price_range_active: active
                            }));
                            setCurrentPage(1);
                        }}
                    />

                    <select name="is_active" value={filters.is_active} onChange={(e) => {
                        setFilters(prev => ({ ...prev, is_active: e.target.value }));
                        setCurrentPage(1);
                    }}>
                        <option value="all">Any Status</option>
                        <option value="active">Active Only</option>
                        <option value="hidden">Hidden Only</option>
                    </select>

                    {activeFilterCount > 0 && (
                        <button className="wp-reset-btn" onClick={clearFilters} title="Reset all filters">
                            <RotateCcw size={14} />
                            <span>Reset</span>
                            <span className="wp-filter-badge">{activeFilterCount}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Selection Summary Line */}
            {selectedIds.size > 0 && (
                <div className="wp-selection-info-line">
                    <CheckSquare size={14} />
                    <span><strong>{selectedIds.size}</strong> item{selectedIds.size !== 1 ? 's' : ''} selected</span>
                    <button onClick={clearSelection}>Clear Selection</button>
                </div>
            )}

            {/* ══ Bulk Action Toolbar ══════════════════════════════ */}
            {selectedIds.size > 0 && (
                <div className="wp-bulk-bar">
                    <div className="wp-bulk-info">
                        <CheckSquare size={18} />
                        <strong>{selectedIds.size}</strong> wallpaper{selectedIds.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="wp-bulk-actions">
                        <DropdownMultiSelect
                            label="Push to Category"
                            options={categories}
                            selectedValues={Array.from(pendingBulkIds)}
                            isOpen={activeDropdown === 'Push to Category'}
                            onToggleDropdown={setActiveDropdown}
                            onToggleItem={togglePendingBulkId}
                            onApply={handleBulkAssignCategory}
                            isBulk
                        />

                        <DropdownMultiSelect
                            label="Push to Group"
                            options={groups}
                            selectedValues={Array.from(pendingBulkIds)}
                            isOpen={activeDropdown === 'Push to Group'}
                            onToggleDropdown={setActiveDropdown}
                            onToggleItem={togglePendingBulkId}
                            onApply={handleBulkAssignGroup}
                            isBulk
                        />

                        <DropdownMultiSelect
                            label="Assign to Book"
                            options={books.map(b => ({ ...b, name: b.name }))}
                            selectedValues={Array.from(pendingBulkIds)}
                            isOpen={activeDropdown === 'Assign to Book'}
                            onToggleDropdown={setActiveDropdown}
                            onToggleItem={togglePendingBulkId}
                            onApply={handleBulkAssignBook}
                            isBulk
                        />

                        {/* Activate */}
                        <button
                            className="wp-bulk-btn activate"
                            onClick={() => handleBulkStatus(true)}
                            disabled={bulkLoading}
                        >
                            <ToggleLeft size={16} />
                            <span>Set Active</span>
                        </button>

                        {/* Hide */}
                        <button
                            className="wp-bulk-btn hide"
                            onClick={() => handleBulkStatus(false)}
                            disabled={bulkLoading}
                        >
                            <ToggleLeft size={16} />
                            <span>Set Hidden</span>
                        </button>

                        {/* Delete */}
                        <button
                            className="wp-bulk-btn delete"
                            onClick={handleBulkDelete}
                            disabled={bulkLoading}
                        >
                            <Trash2 size={16} />
                            <span>Delete</span>
                        </button>

                        {/* Clear */}
                        <button className="wp-bulk-clear" onClick={clearSelection}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ══ Table ════════════════════════════════════════════ */}
            <div className="wp-table-wrap">
                <table className="wp-table">
                    <thead>
                        <tr>
                            {/* Checkbox */}
                            <th className="wp-th-check">
                                <button
                                    className={`wp-check-btn ${allPageSelected ? 'checked' : somePageSelected ? 'partial' : ''}`}
                                    onClick={toggleSelectAll}
                                    title={allPageSelected ? 'Deselect all' : 'Select all on page'}
                                >
                                    {allPageSelected
                                        ? <CheckSquare size={17} />
                                        : somePageSelected
                                            ? <CheckSquare size={17} style={{ opacity: 0.5 }} />
                                            : <Square size={17} />
                                    }
                                </button>
                            </th>
                            <th className="wp-th-sno">S.No</th>
                            <th>Image</th>
                            <th>Name / Code</th>
                            <th>Category</th>
                            <th className="wp-align-right">Price</th>
                            <th className="wp-align-right">Stock</th>
                            <th className="wp-align-center">Status</th>
                            <th className="wp-align-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9"><Loader message="Fetching wallpapers..." /></td></tr>
                        ) : filteredWallpapers.length === 0 ? (
                            <tr><td colSpan="9" className="wp-empty">No wallpapers found.</td></tr>
                        ) : (
                            paginatedWallpapers.map((w, index) => {
                                const sno = (currentPage - 1) * itemsPerPage + index + 1;
                                const isSelected = selectedIds.has(w.id);
                                return (
                                    <tr
                                        key={w.id}
                                        className={isSelected ? 'wp-row-selected' : ''}
                                        onClick={() => toggleRow(w.id)}
                                    >
                                        {/* Checkbox */}
                                        <td className="wp-td-check" onClick={e => e.stopPropagation()}>
                                            <button
                                                className={`wp-row-check ${isSelected ? 'checked' : ''}`}
                                                onClick={() => toggleRow(w.id)}
                                            >
                                                {isSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                                            </button>
                                        </td>

                                        <td className="wp-td-sno">{sno}</td>

                                        <td>
                                            <img
                                                src={w.images?.[0]?.image_url || 'https://placehold.co/48x48/1e293b/94a3b8?text=?'}
                                                alt={w.name}
                                                className="wp-thumb"
                                            />
                                        </td>

                                        <td>
                                            <div className="wp-name-cell">
                                                <strong>{w.name}</strong>
                                                <span>{w.design_code || w.slug}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="wp-cat-stack">
                                                {w.categories?.length > 0
                                                    ? w.categories.map(c => (
                                                        <span key={c.id} className="wp-pill">{c.name}</span>
                                                    ))
                                                    : <span className="wp-pill muted">Uncategorized</span>
                                                }
                                            </div>
                                        </td>

                                        <td className="wp-align-right wp-price">
                                            ₹{w.price || '0'}
                                        </td>

                                        <td className="wp-align-right">
                                            <span className={`wp-stock ${(w.quantity || 0) > 0 ? 'in' : 'out'}`}>
                                                {w.quantity || 0}
                                            </span>
                                        </td>

                                        <td className="wp-align-center">
                                            <span className={`wp-status ${w.is_active ? 'active' : 'hidden'}`}>
                                                {w.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>

                                        <td className="wp-align-center" onClick={e => e.stopPropagation()}>
                                            <div className="wp-actions">
                                                <button className="wp-icon-btn" title="View" onClick={() => handleView(w)}>
                                                    <Eye size={15} />
                                                </button>
                                                <button className="wp-icon-btn" title="Edit" onClick={() => handleEdit(w)}>
                                                    <Edit size={15} />
                                                </button>
                                                <button className="wp-icon-btn danger" title="Delete" onClick={() => handleDelete(w.id)}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ══ Pagination ═══════════════════════════════════════ */}
            <div className="wp-pagination">
                <div className="wp-pg-info">
                    Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredWallpapers.length)}</strong>
                    {' '}–{' '}
                    <strong>{Math.min(currentPage * itemsPerPage, filteredWallpapers.length)}</strong>
                    {' '}of{' '}
                    <strong>{filteredWallpapers.length.toLocaleString()}</strong> records
                    {selectedIds.size > 0 && (
                        <span className="wp-pg-sel"> · {selectedIds.size} selected</span>
                    )}
                </div>
                <div className="wp-pg-controls">
                    <div className="wp-pg-size">
                        <label>Per page:</label>
                        <select value={itemsPerPage} onChange={e => {
                            setItemsPerPage(+e.target.value);
                            setCurrentPage(1);
                        }}>
                            {[50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="wp-pg-btns">
                        <button className="wp-pg-btn" disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .map((p, i, arr) => {
                                if (i > 0 && p - arr[i - 1] > 1) {
                                    return <span key={`d${p}`} className="wp-dots">…</span>;
                                }
                                return (
                                    <button
                                        key={p}
                                        className={`wp-pg-num ${currentPage === p ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(p)}
                                    >{p}</button>
                                );
                            })
                        }
                        <button className="wp-pg-btn" disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>

            {/* ══ Modals ═══════════════════════════════════════════ */}
            <WallpaperModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                wallpaper={currentWallpaper}
                categories={categories}
                groups={groups}
                books={books}
            />
            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onRefresh={fetchWallpapers}
            />

            {/* ══ Scoped Styles ════════════════════════════════════ */}
            <style>{`
                .wp-page { padding: 2rem; max-width: 100%; }

                /* Header */
                .wp-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.75rem; }
                .wp-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.35rem 0; }
                .wp-header p { color: var(--text-muted); font-size: 0.9375rem; margin: 0; }
                .wp-header-actions { display: flex; gap: 0.75rem; align-items: center; }

                /* Buttons */
                .wp-btn-primary { display:flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,var(--primary),var(--primary-dark,#2563eb));color:white;border:none;border-radius:.75rem;font-size:.875rem;font-weight:600;cursor:pointer;height:40px;padding:0 1.125rem;transition:all .2s;box-shadow:0 4px 12px rgba(37,99,235,.25); }
                .wp-btn-primary:hover { transform:translateY(-1px);box-shadow:0 6px 18px rgba(37,99,235,.35); }
                .wp-btn-secondary { display:flex;align-items:center;gap:.5rem;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-muted);border-radius:.75rem;font-size:.875rem;font-weight:500;cursor:pointer;height:40px;padding:0 1rem;transition:all .2s; }
                .wp-btn-secondary:hover { border-color:var(--primary);color:var(--primary); }

                /* Filter bar */
                .wp-filter-bar { background:var(--bg-card);border:1px solid var(--border-color);border-radius:1rem;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;flex-direction:column;gap:.875rem;box-shadow:0 2px 8px rgba(0,0,0,.05); }
                .wp-search { display:flex;align-items:center;gap:.625rem;background:var(--bg-input);border:1px solid var(--border-color);border-radius:.75rem;padding:.5rem .875rem;transition:all .2s;position:relative; }
                .wp-search:focus-within { border-color:var(--primary);box-shadow:0 0 0 3px rgba(59,130,246,.1); }
                .wp-search input { border:none;background:none;outline:none;width:100%;color:var(--text-main);font-size:.875rem; }
                .wp-clear-search { background:none;border:none;color:var(--text-dim);cursor:pointer;display:flex;padding:.1rem;border-radius:.25rem;transition:color .2s; }
                .wp-clear-search:hover { color:var(--danger,#ef4444); }

                .wp-filters { display:flex;flex-wrap:wrap;gap:.625rem;align-items:center; }
                .wp-filters select { background:var(--bg-input);border:1px solid var(--border-color);border-radius:.625rem;padding:.5rem .75rem;color:var(--text-main);font-size:.8125rem;outline:none;cursor:pointer;transition:border-color .2s;min-width:130px; }
                .wp-filters select:focus { border-color:var(--primary); }
                .wp-reset-btn { display:flex;align-items:center;gap:.4rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#ef4444;border-radius:.625rem;padding:.45rem .75rem;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s; }
                .wp-reset-btn:hover { background:rgba(239,68,68,.15); }
                .wp-filter-badge { background:#ef4444;color:white;border-radius:999px;font-size:.65rem;padding:.05rem .35rem;font-weight:700; }
                
                .wp-selection-info-line { display: flex; align-items: center; gap: 0.75rem; background: rgba(59, 130, 246, 0.08); border-radius: 0.75rem; padding: 0.625rem 1rem; margin-bottom: 1.25rem; font-size: 0.875rem; color: var(--text-main); border: 1px dashed rgba(59, 130, 246, 0.3); animation: wpFadeIn 0.2s ease; }
                .wp-selection-info-line strong { color: var(--primary); }
                .wp-selection-info-line button { background: none; border: none; color: var(--text-muted); text-decoration: underline; cursor: pointer; font-size: 0.8rem; margin-left: auto; transition: color 0.15s; }
                .wp-selection-info-line button:hover { color: var(--danger); }

                /* Custom Multi-Select Dropdown */
                .custom-dropdown { position: relative; }
                .dropdown-trigger { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 0.625rem; padding: 0.45rem 0.875rem; font-size: 0.875rem; color: var(--text-main); cursor: pointer; min-width: 140px; transition: all 0.2s; white-space: nowrap; }
                .dropdown-trigger.active { background: rgba(59, 130, 246, 0.05); border-color: var(--primary); color: var(--primary); font-weight: 600; }
                .dropdown-menu { position: absolute; top: calc(100% + 5px); left: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; min-width: 240px; overflow: hidden; animation: wpFadeIn 0.2s ease; }
                .dropdown-options { max-height: 250px; overflow-y: auto; padding: 0.5rem; }
                .dropdown-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; cursor: pointer; transition: background 0.15s; font-size: 0.875rem; color: var(--text-main); }
                .dropdown-option:hover { background: var(--bg-hover); }
                .dropdown-option input { cursor: pointer; width: 16px; height: 16px; accent-color: var(--primary); }
                .opt-code { font-size: 0.75rem; color: var(--text-muted); margin-left: auto; background: var(--bg-hover); padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
                .dropdown-footer { padding: 0.75rem; border-top: 1px solid var(--border); background: var(--bg-hover); }
                .apply-btn { width: 100%; background: var(--primary); color: white; border: none; border-radius: 0.5rem; padding: 0.625rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
                .apply-btn:hover { opacity: 0.9; }

                /* Bulk bar buttons adjustment */
                .wp-bulk-actions .custom-dropdown { height: 100%; display: flex; align-items: center; }
                .wp-bulk-actions .custom-dropdown .dropdown-trigger { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; font-weight: 500; height: 38px; }
                .wp-bulk-actions .custom-dropdown .dropdown-trigger:hover { background: rgba(255,255,255,0.25); }
                .wp-bulk-actions .custom-dropdown .dropdown-menu { top: auto; bottom: calc(100% + 12px); right: 0; left: auto; color: var(--text-main); }

                /* Bulk bar */
                .wp-bulk-bar { display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:white;border-radius:.875rem;padding:.875rem 1.25rem;margin-bottom:1.25rem;animation:wpSlideIn .25s cubic-bezier(.16,1,.3,1);box-shadow:0 8px 24px rgba(29,78,216,.3); }
                @keyframes wpSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                .wp-bulk-info { display:flex;align-items:center;gap:.625rem;font-size:.9rem;font-weight:500; }
                .wp-bulk-actions { display:flex;align-items:center;gap:.5rem; }
                .wp-bulk-btn { display:flex;align-items:center;gap:.4rem;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:white;border-radius:.625rem;padding:.45rem .875rem;font-size:.8125rem;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap; }
                .wp-bulk-btn:hover:not(:disabled) { background:rgba(255,255,255,.2); }
                .wp-bulk-btn:disabled { opacity:.5;cursor:not-allowed; }
                .wp-bulk-btn.delete { border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.15);color:#fca5a5; }
                .wp-bulk-btn.delete:hover:not(:disabled) { background:rgba(248,113,113,.3); }
                .wp-bulk-btn.activate { border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.1);color:#6ee7b7; }
                .wp-bulk-btn.hide { border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.1);color:#fde68a; }
                .wp-bulk-clear { background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:white;border-radius:.5rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;margin-left:.25rem; }
                .wp-bulk-clear:hover { background:rgba(255,255,255,.2); }

                /* Dropdown */
                .wp-dropdown { position:relative; }
                .wp-dropdown-menu { position:absolute;top:calc(100% + .5rem);left:0;background:var(--bg-card);border:1px solid var(--border-color);border-radius:.875rem;min-width:220px;box-shadow:0 16px 40px rgba(0,0,0,.2);z-index:500;overflow:hidden;animation:wpFadeIn .15s ease; }
                @keyframes wpFadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
                .wp-dd-item { display:flex;align-items:center;gap:.625rem;width:100%;padding:.75rem 1rem;background:none;border:none;color:var(--text-main);font-size:.875rem;cursor:pointer;transition:background .15s;text-align:left; }
                .wp-dd-item:hover { background:var(--bg-hover);color:var(--primary); }
                .wp-dd-code { margin-left:auto;font-size:.7rem;color:var(--text-muted);background:var(--bg-input);padding:.1rem .4rem;border-radius:.3rem; }
                .wp-dd-empty { padding:1rem;text-align:center;color:var(--text-dim);font-size:.875rem; }

                /* Table */
                .wp-table-wrap { background:var(--bg-card);border:1px solid var(--border-color);border-radius:1rem;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.06); }
                .wp-table { width:100%;border-collapse:separate;border-spacing:0; }
                .wp-table th { background:var(--bg-header-bar);padding:.875rem 1.25rem;text-align:left;color:var(--text-dim);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border-color); }
                .wp-table td { padding:.875rem 1.25rem;border-bottom:1px solid var(--border-color);color:var(--text-main);font-size:.875rem;vertical-align:middle;cursor:pointer; }
                .wp-table tr:last-child td { border-bottom:none; }
                .wp-table tr:hover td { background:var(--bg-hover); }
                .wp-row-selected td { background:rgba(59,130,246,.06) !important;border-bottom-color:rgba(59,130,246,.15) !important; }

                /* Checkbox columns */
                .wp-th-check, .wp-td-check { width:44px;padding:.875rem .75rem !important;cursor:default; }
                .wp-th-sno, .wp-td-sno { width:60px;color:var(--text-dim); }
                .wp-check-btn, .wp-row-check { background:none;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-dim);transition:color .15s;padding:.1rem; }
                .wp-check-btn.checked, .wp-row-check.checked { color:var(--primary); }
                .wp-check-btn:hover, .wp-row-check:hover { color:var(--primary); }

                /* Cell specifics */
                .wp-align-right { text-align:right !important; }
                .wp-align-center { text-align:center !important; }
                .wp-thumb { width:44px;height:44px;border-radius:.5rem;object-fit:cover;background:var(--bg-input);display:block; }
                .wp-name-cell { display:flex;flex-direction:column; }
                .wp-name-cell strong { font-size:.9rem;font-weight:600;color:var(--text-main); }
                .wp-name-cell span { font-size:.75rem;color:var(--text-muted);margin-top:.1rem; }
                .wp-cat-stack { display:flex;flex-wrap:wrap;gap:.25rem;max-width:180px; }
                .wp-pill { font-size:.65rem;padding:.15rem .45rem;background:var(--bg-input);border:1px solid var(--border-color);border-radius:.35rem;color:var(--text-muted);white-space:nowrap; }
                .wp-pill.muted { color:var(--text-dim);border-style:dashed; }
                .wp-price { font-weight:600;font-size:.875rem; }
                .wp-stock { font-weight:600;font-size:.875rem; }
                .wp-stock.in { color:var(--success,#10b981); }
                .wp-stock.out { color:var(--danger,#ef4444); }
                .wp-status { display:inline-block;padding:.2rem .7rem;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em; }
                .wp-status.active { background:rgba(16,185,129,.12);color:#10b981; }
                .wp-status.hidden { background:rgba(100,116,139,.12);color:#64748b; }
                .wp-actions { display:flex;gap:.375rem;justify-content:center; }
                .wp-icon-btn { width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:var(--bg-input);border:1px solid var(--border-color);border-radius:.5rem;color:var(--text-muted);cursor:pointer;transition:all .2s; }
                .wp-icon-btn:hover { background:var(--bg-hover);border-color:var(--primary);color:var(--primary); }
                .wp-icon-btn.danger:hover { border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.08); }
                .wp-empty { text-align:center;padding:4rem;color:var(--text-dim);font-style:italic; }

                /* Pagination */
                .wp-pagination { display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;margin-top:1.25rem;border-top:1px solid var(--border-color); }
                .wp-pg-info { font-size:.875rem;color:var(--text-muted); }
                .wp-pg-info strong { color:var(--text-main); }
                .wp-pg-sel { color:var(--primary);font-weight:600; }
                .wp-pg-controls { display:flex;align-items:center;gap:1.5rem; }
                .wp-pg-size { display:flex;align-items:center;gap:.625rem; }
                .wp-pg-size label { font-size:.8rem;color:var(--text-dim); }
                .wp-pg-size select { background:var(--bg-card);border:1px solid var(--border-color);border-radius:.5rem;padding:.35rem .6rem;color:var(--text-main);font-size:.8125rem;outline:none; }
                .wp-pg-btns { display:flex;align-items:center;gap:.375rem; }
                .wp-pg-btn { padding:.4rem .875rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:.5rem;color:var(--text-muted);font-size:.8125rem;cursor:pointer;transition:all .2s; }
                .wp-pg-btn:hover:not(:disabled) { border-color:var(--primary);color:var(--primary); }
                .wp-pg-btn:disabled { opacity:.4;cursor:not-allowed; }
                .wp-pg-num { min-width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid transparent;border-radius:.5rem;color:var(--text-muted);font-size:.8125rem;cursor:pointer;transition:all .2s; }
                .wp-pg-num:hover { background:var(--bg-hover);color:var(--primary); }
                .wp-pg-num.active { background:var(--primary);color:white;border-color:var(--primary); }
                .wp-dots { color:var(--text-dim);padding:0 .25rem;font-size:.875rem; }

                /* Price Slider Custom Styles */
                .price-slider-menu { min-width: 300px; padding: 0; }
                .price-slider-content { padding: 1.25rem; }
                .price-slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .price-label { font-size: 0.875rem; font-weight: 600; color: var(--text-main); }
                .price-reset-link { background: none; border: none; color: var(--primary); font-size: 0.75rem; cursor: pointer; padding: 0; }
                .price-reset-link:hover { text-decoration: underline; }

                .slider-container { position: relative; width: 100%; height: 6px; margin: 2rem 0; }
                .slider-track { position: absolute; height: 100%; width: 100%; background: var(--bg-input); border-radius: 3px; z-index: 1; }
                .slider-range { position: absolute; height: 100%; background: var(--primary); border-radius: 3px; z-index: 2; }
                
                .thumb { position: absolute; -webkit-appearance: none; appearance: none; width: 100%; background: none; pointer-events: none; z-index: 3; height: 6px; top: 0; outline: none; }
                .thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; border: 2px solid var(--primary); cursor: pointer; pointer-events: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.15s; }
                .thumb::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: white; border: 2px solid var(--primary); cursor: pointer; pointer-events: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.15s; }
                .thumb::-webkit-slider-thumb:hover { transform: scale(1.1); }
                
                .price-inputs { display: flex; gap: 1rem; margin-top: 1rem; }
                .price-input-group { flex: 1; }
                .price-input-group label { display: block; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
                .input-with-symbol { display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.35rem 0.625rem; }
                .input-with-symbol span { color: var(--text-dim); font-size: 0.875rem; margin-right: 0.25rem; font-weight: 500; }
                .input-with-symbol input { border: none; background: none; width: 100%; font-size: 0.875rem; color: var(--text-main); font-weight: 500; outline: none; }
                .input-with-symbol input::-webkit-inner-spin-button, .input-with-symbol input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            `}</style>
        </div>
    );
};

export default Wallpapers;
