import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const InventoryManagement = () => {
    const [importing, setImporting] = useState(false);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        setSummary(null);
        setError(null);

        try {
            const res = await api.post('/wallpapers/bulk-update-quantity', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSummary(res.data.summary);
        } catch (error) {
            console.error('Import failed', error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset input
        }
    };

    const downloadTemplate = () => {
        const headers = ['design_code', 'quantity'];
        const sampleRows = [
            ['WP-001', '50'],
            ['WP-002', '120']
        ];
        const csvContent = [headers, ...sampleRows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "inventory_update_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="inventory-page">
            <header className="page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p>Bulk update wallpaper stock levels using CSV files.</p>
                </div>
            </header>

            <div className="inventory-grid">
                <div className="upload-section glass-panel">
                    <div className="section-header">
                        <div className="icon-wrap primary">
                            <Upload size={24} />
                        </div>
                        <h3>Upload Inventory File</h3>
                    </div>

                    <p className="instruction-text">
                        Upload a CSV file containing <strong>design code</strong> and <strong>quantity</strong>.
                        The system will automatically match the codes and update the stock levels.
                    </p>

                    <div className="upload-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={importing}
                        >
                            <Upload size={20} />
                            <span>{importing ? 'Processing File...' : 'Select CSV File'}</span>
                        </button>
                        <button className="btn btn-secondary" onClick={downloadTemplate}>
                            <Download size={20} />
                            <span>Download Template</span>
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportCSV}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />

                    {summary && (
                        <div className="result-summary">
                            <div className="summary-card success">
                                <CheckCircle2 size={20} />
                                <div>
                                    <h4>Import Complete</h4>
                                    <p>Successfully updated <strong>{summary.updated}</strong> out of <strong>{summary.total}</strong> records.</p>
                                </div>
                            </div>

                            {summary.failed > 0 && (
                                <div className="summary-errors">
                                    <div className="error-header">
                                        <AlertCircle size={16} />
                                        <span>Failed Updates ({summary.failed})</span>
                                    </div>
                                    <ul className="error-list">
                                        {summary.errors.slice(0, 5).map((err, idx) => (
                                            <li key={idx}>
                                                <strong>{err.designCode || 'Row ' + idx}:</strong> {err.error}
                                            </li>
                                        ))}
                                        {summary.errors.length > 5 && <li>...and {summary.errors.length - 5} more</li>}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="guide-section glass-panel">
                    <div className="section-header">
                        <div className="icon-wrap secondary">
                            <FileText size={24} />
                        </div>
                        <h3>CSV Format Guide</h3>
                    </div>

                    <ul className="guide-list">
                        <li>
                            <strong>Columns:</strong> Your CSV must have <code>design code</code> and <code>quantity</code> columns.
                        </li>
                        <li>
                            <strong>Flexibility:</strong> Headers like <code>design_code</code>, <code>Design Code</code>, or <code>Quantity</code> are all accepted.
                        </li>
                        <li>
                            <strong>Units:</strong> Quantity should be a positive whole number.
                        </li>
                    </ul>

                    <div className="csv-preview">
                        <div className="preview-label">Sample CSV Structure:</div>
                        <pre>
                            design code, quantity{"\n"}
                            WP-101, 150{"\n"}
                            WP-102, 75{"\n"}
                            WP-103, 0
                        </pre>
                    </div>
                </div>
            </div>

            <style>{`
                .inventory-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
                .glass-panel { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.5rem; padding: 2rem; box-shadow: var(--shadow-premium); }
                .section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .icon-wrap { width: 48px; height: 48px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
                .icon-wrap.primary { background: rgba(59, 130, 246, 0.1); color: var(--primary); }
                .icon-wrap.secondary { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                h3 { margin: 0; font-size: 1.25rem; color: var(--text-main); }
                .instruction-text { color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem; }
                .upload-actions { display: flex; gap: 1rem; }
                .guide-list { padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                .guide-list li { display: flex; gap: 0.5rem; color: var(--text-muted); font-size: 0.9375rem; }
                .guide-list strong { color: var(--text-main); }
                .csv-preview { background: var(--bg-dark); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); }
                .preview-label { font-size: 0.75rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.75rem; }
                pre { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; color: #a5b4fc; }
                
                .result-summary { margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 2rem; }
                .summary-card { display: flex; gap: 1rem; padding: 1.25rem; border-radius: 1rem; margin-bottom: 1.5rem; }
                .summary-card.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .summary-card h4 { margin: 0 0 0.25rem 0; font-size: 1rem; }
                .summary-card p { margin: 0; font-size: 0.875rem; opacity: 0.9; }
                
                .summary-errors { background: rgba(239, 68, 68, 0.05); border-radius: 1rem; padding: 1.25rem; border: 1px solid rgba(239, 68, 68, 0.1); }
                .error-header { display: flex; align-items: center; gap: 0.5rem; color: #ef4444; font-weight: 600; font-size: 0.875rem; margin-bottom: 1rem; }
                .error-list { margin: 0; padding: 0 0 0 1.25rem; list-style: disc; font-size: 0.8125rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.5rem; }
                .error-alert { margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1rem; border-radius: 1rem; font-size: 0.875rem; }

                @media (max-width: 1024px) {
                    .inventory-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default InventoryManagement;
