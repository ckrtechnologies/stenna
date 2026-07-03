import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Upload, Package, RefreshCw, Download, Search, Edit2, Trash2, Check, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Papa from 'papaparse';
import Button from '../components/ui/Button';

const Dashboard = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [uploadReport, setUploadReport] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    
    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    
    // Bulk edit
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkQuantity, setBulkQuantity] = useState('');
    
    // Inline edit
    const [editingId, setEditingId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/wa-inventory?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
            setInventory(res.data.data || []);
            setTotalCount(res.data.count || 0);
            setSelectedIds([]); // Clear selection on fetch
        } catch (err) {
            console.error("Failed to fetch inventory", err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, page, limit]);

    useEffect(() => {
        setPage(1); // Reset to page 1 on new search
    }, [searchTerm]);

    useEffect(() => {
        // Simple debounce for search
        const delayDebounceFn = setTimeout(() => {
            fetchInventory();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, page, limit, fetchInventory]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage({ type: '', text: '' });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a CSV file first.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadProgress(0);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/wa-inventory/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            const { success, inserted, updated, failed, errors } = res.data.data;
            
            setUploadReport(res.data.data);
            setMessage({ type: 'success', text: `Upload complete! Please view the report for details.` });
            
            setFile(null);
            document.getElementById('csv-upload').value = '';
            fetchInventory();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed.' });
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const downloadCSV = async () => {
        setIsExporting(true);
        try {
            let allData = [];
            let currentPage = 1;
            const limitPerPage = 1000; // Fetch in chunks to bypass Supabase 1000 row limits
            let hasMore = true;

            while (hasMore) {
                const res = await api.get(`/wa-inventory?page=${currentPage}&limit=${limitPerPage}&search=${encodeURIComponent(searchTerm)}`);
                const chunk = res.data.data || [];
                allData = [...allData, ...chunk];
                
                if (chunk.length < limitPerPage) {
                    hasMore = false;
                } else {
                    currentPage++;
                }
            }
            
            if (allData.length === 0) {
                alert("No data available to export.");
                return;
            }

            const data = allData.map(item => ({
                'Design Code': item.design_code,
                'Quantity': item.quantity,
                'Last Updated': new Date(item.updated_at).toLocaleString()
            }));
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'wa_inventory_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to export CSV", err);
            alert("Failed to export data.");
        } finally {
            setIsExporting(false);
        }
    };

    const downloadTemplate = () => {
        const data = [{ 'design_code': 'EXAMPLE-123', 'quantity': 50 }];
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'wa_inventory_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- CRUD Operations ---
    
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/wa-inventory/${id}`);
            fetchInventory();
        } catch (err) {
            alert('Failed to delete item.');
        }
    };

    const handleEditSave = async (id) => {
        try {
            await api.put(`/wa-inventory/${id}`, { quantity: parseInt(editQuantity, 10) });
            setEditingId(null);
            fetchInventory();
        } catch (err) {
            alert('Failed to update quantity.');
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkQuantity || selectedIds.length === 0) return;
        try {
            await api.post(`/wa-inventory/bulk-update`, { 
                ids: selectedIds, 
                quantity: parseInt(bulkQuantity, 10) 
            });
            setBulkQuantity('');
            setSelectedIds([]);
            fetchInventory();
        } catch (err) {
            alert('Failed to bulk update items.');
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(inventory.map(item => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    return (
        <AdminLayout>
            <div className="page-header">
                <div className="header-content">
                    <h1>WA Inventory Management</h1>
                    <p>Manage and upload your WhatsApp inventory</p>
                </div>
            </div>

            <div style={{ padding: '2rem' }}>
                <section style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
                            <Upload size={20} /> Bulk Upload Inventory (CSV)
                        </h3>
                        <Button onClick={downloadTemplate} variant="secondary">
                            <Download size={16} /> Sample Template
                        </Button>
                    </div>
                    
                    <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }} disabled={uploading} />
                        <Button type="submit" disabled={uploading || !file}>
                            {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                            {uploading ? 'Processing...' : 'Upload CSV'}
                        </Button>
                    </form>
                    
                    {uploading && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {uploadProgress < 100 ? (
                                        <>Uploading file...</>
                                    ) : (
                                        <><RefreshCw size={14} className="animate-spin" /> Processing on server (this may take a moment)...</>
                                    )}
                                </span>
                                <span style={{ fontWeight: '500' }}>{uploadProgress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }}></div>
                            </div>
                        </div>
                    )}
                    
                    {message.text && !uploading && (
                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: message.type === 'error' ? '#ef4444' : '#22c55e', border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}` }}>
                            {message.text}
                        </div>
                    )}
                </section>

                <section style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                    {/* Header Row: Title and Search/Export tools */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
                            <Package size={20} /> Current Inventory
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search design code..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <Button onClick={downloadCSV} variant="secondary" disabled={inventory.length === 0 || isExporting}>
                                {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                                {isExporting ? 'Exporting...' : 'Export (CSV)'}
                            </Button>
                            <Button onClick={() => { setSearchTerm(''); fetchInventory(); }} variant="secondary">
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions Panel */}
                    {selectedIds.length > 0 && (
                        <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{selectedIds.length} items selected</span>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }}></div>
                            <input 
                                type="number" 
                                placeholder="New quantity" 
                                value={bulkQuantity}
                                onChange={(e) => setBulkQuantity(e.target.value)}
                                style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', width: '150px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            />
                            <Button onClick={handleBulkUpdate} disabled={!bulkQuantity}>
                                Bulk Update
                            </Button>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.5rem', width: '40px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={inventory.length > 0 && selectedIds.length === inventory.length}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', width: '60px' }}>S.NO</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Design Code</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Quantity</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Last Updated</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</td>
                                    </tr>
                                ) : inventory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No inventory found.</td>
                                    </tr>
                                ) : (
                                    inventory.map((item, index) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', background: selectedIds.includes(item.id) ? 'rgba(37, 99, 235, 0.05)' : 'transparent' }}>
                                            <td style={{ padding: '0.5rem' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelection(item.id)}
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{index + 1}</td>
                                            <td style={{ padding: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>{item.design_code}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                {editingId === item.id ? (
                                                    <input 
                                                        type="number" 
                                                        value={editQuantity} 
                                                        onChange={(e) => setEditQuantity(e.target.value)} 
                                                        style={{ width: '80px', padding: '0.25rem', border: '1px solid #2563eb', borderRadius: '0.25rem' }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                {new Date(item.updated_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    {editingId === item.id ? (
                                                        <>
                                                            <Button onClick={() => handleEditSave(item.id)} variant="ghost" className="success" size="icon" title="Save">
                                                                <Check size={18} />
                                                            </Button>
                                                            <Button onClick={() => setEditingId(null)} variant="ghost" className="danger" size="icon" title="Cancel">
                                                                <X size={18} />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button onClick={() => { setEditingId(item.id); setEditQuantity(item.quantity.toString()); }} variant="ghost" className="primary" size="icon" title="Edit Quantity">
                                                                <Edit2 size={18} />
                                                            </Button>
                                                            <Button onClick={() => handleDelete(item.id)} variant="ghost" className="danger" size="icon" title="Delete Row">
                                                                <Trash2 size={18} />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '0.875rem' }}>Rows per page:</span>
                            <select 
                                value={limit} 
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '0.875rem' }}>
                                {totalCount === 0 ? '0' : `${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)}`} of {totalCount}
                            </span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <Button 
                                    variant="secondary" 
                                    style={{ padding: '0.25rem 0.5rem', height: 'auto', minHeight: 'auto' }}
                                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                                    disabled={page === 1}
                                >
                                    Prev
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    style={{ padding: '0.25rem 0.5rem', height: 'auto', minHeight: 'auto' }}
                                    onClick={() => setPage(p => p + 1)} 
                                    disabled={page * limit >= totalCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {uploadReport && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>Upload Report</h2>
                            <Button variant="ghost" size="icon" onClick={() => setUploadReport(null)}>
                                <X size={20} />
                            </Button>
                        </div>
                        <div className="modal-form" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#22c55e' }}>{uploadReport.inserted}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>New Products</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6' }}>{uploadReport.updated}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Updated</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ef4444' }}>{uploadReport.failed}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Failed</div>
                                </div>
                            </div>
                            
                            {uploadReport.errors && uploadReport.errors.length > 0 && (
                                <div>
                                    <h4 style={{ marginBottom: '1rem', color: '#ef4444' }}>Failed Rows ({uploadReport.errors.length})</h4>
                                    <div style={{ background: 'var(--bg-hover)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                                            <thead style={{ background: 'rgba(0,0,0,0.05)' }}>
                                                <tr>
                                                    <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>Row Data</th>
                                                    <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>Error</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uploadReport.errors.map((err, i) => (
                                                    <tr key={i} style={{ borderBottom: i === uploadReport.errors.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '0.5rem 1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                                                            {JSON.stringify(err.row)}
                                                        </td>
                                                        <td style={{ padding: '0.5rem 1rem', color: '#ef4444' }}>
                                                            {err.error}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setUploadReport(null)}>Close Report</Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Dashboard;
