import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2, Loader2, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import api from '../utils/api';

const BulkUploadModal = ({ isOpen, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const templateHeaders = [
        'Name', 'Design Code', 'Slug', 'Description', 'Price',
        'Roll Width (cm)', 'Roll Height (m)', 'Stock Quantity',
        'Material', 'Finish', 'Washability', 'Durability',
        'Brand', 'Country', 'Tagline', 'Vibe', 'Choose If',
        'Avoid If', 'Ideal For', 'Is Active', 'Swatch Image',
        'Hand Image', 'Medium Short', 'Far Short', 'Warm Family', 'Modal with Book', 'Rustic',
        'Sponge Wash Video',
        'Category Names', 'Group Names'
    ];

    const handleDownloadTemplate = () => {
        const sampleRow = {
            'Name': 'Example Wallpaper',
            'Design Code': 'EX-101',
            'Slug': 'example-wallpaper',
            'Description': 'A beautiful silk texture wallpaper.',
            'Price': '2500',
            'Roll Width (cm)': '53',
            'Roll Height (m)': '10',
            'Stock Quantity': '50',
            'Material': 'Non-woven',
            'Finish': 'Matte',
            'Washability': 'Washable',
            'Durability': 'High',
            'Brand': 'Stenna',
            'Country': 'Italy',
            'Tagline': 'Luxury for your walls',
            'Vibe': 'Calm and sophisticated',
            'Choose If': 'You want a premium feel',
            'Avoid If': 'You prefer bold patterns',
            'Ideal For': 'Living Room, Bedroom',
            'Is Active': 'TRUE',
            'Swatch Image': 'https://example.com/swatch.jpg',
            'Hand Image': 'https://example.com/hand.jpg',
            'Medium Short': 'https://example.com/medium.jpg',
            'Far Short': 'https://example.com/far.jpg',
            'Warm Family': 'https://example.com/family.jpg',
            'Modal with Book': 'https://example.com/book.jpg',
            'Rustic': 'https://example.com/rustic.jpg',
            'Sponge Wash Video': 'https://example.com/wash.mp4',
            'Category Names': 'Floral, Luxury',
            'Group Names': 'Wallpapers'
        };

        const csv = Papa.unparse({
            fields: templateHeaders,
            data: [sampleRow]
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'wallpaper_bulk_upload_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setPreview(results.data.slice(0, 5));
                },
                error: (err) => {
                    setError('Failed to parse CSV file: ' + err.message);
                }
            });
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResults(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (parseResults) => {
                try {
                    const formattedData = parseResults.data.map(row => {
                        const getVal = (...keys) => {
                            for (const key of keys) {
                                if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
                                    return row[key];
                                }
                            }
                            return undefined;
                        };

                        const widthVal = getVal(
                            'Roll Width (cm)', 'Roll Width', 'Roll Width(cm)', 'Width (cm)', 
                            'Width(cm)', 'Width', 'roll_width', 'Roll_Width', 'roll_width_cm'
                        );
                        const heightVal = getVal(
                            'Roll Height (m)', 'Roll Height', 'Roll Height(m)', 'Height (m)', 
                            'Height(m)', 'Height', 'roll_height', 'Roll_Height', 'roll_height_m',
                            'Roll Length (m)', 'Roll Length', 'Length (m)', 'Length'
                        );
                        const quantityVal = getVal(
                            'Stock Quantity', 'Stock', 'Quantity', 'quantity', 'stock', 
                            'stock_quantity', 'Stock_Quantity', 'Qty', 'qty'
                        );
                        const priceVal = getVal('Price', 'price', 'Price (Rs.)', 'Price (INR)');
                        const activeVal = getVal('Is Active', 'is_active', 'Active', 'active', 'Status', 'status');

                        return {
                            name: getVal('Name', 'name', 'Wallpaper Name', 'Title') || '',
                            design_code: getVal('Design Code', 'design_code', 'DesignCode', 'Code', 'code') || '',
                            slug: getVal('Slug', 'slug') || (getVal('Name', 'name') ? String(getVal('Name', 'name')).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''),
                            description: getVal('Description', 'description') || '',
                            price: priceVal ? parseFloat(priceVal) || 0 : 0,
                            roll_width: widthVal ? parseFloat(widthVal) || null : null,
                            roll_height: heightVal ? parseFloat(heightVal) || null : null,
                            quantity: quantityVal ? parseInt(quantityVal, 10) || 0 : 0,
                            material: getVal('Material', 'material') || '',
                            finish: getVal('Finish', 'finish') || '',
                            washability: getVal('Washability', 'washability') || '',
                            durability: getVal('Durability', 'durability') || '',
                            brand: getVal('Brand', 'brand') || '',
                            country: getVal('Country', 'country') || '',
                            tagline: getVal('Tagline', 'tagline') || '',
                            vibe: getVal('Vibe', 'vibe') || '',
                            choose_if: getVal('Choose If', 'choose_if', 'Choose_If') || '',
                            avoid_if: getVal('Avoid If', 'avoid_if', 'Avoid_If') || '',
                            ideal_for: getVal('Ideal For', 'ideal_for', 'Ideal_For') || '',
                            is_active: activeVal !== undefined ? String(activeVal).trim().toUpperCase() !== 'FALSE' : true,
                            swatch: getVal('Swatch Image', 'Swatch', 'swatch', 'swatch_image') || null,
                            images: [
                                getVal('Hand Image', 'hand_image'),
                                getVal('Medium Short', 'medium_short', 'Medium Shot'),
                                getVal('Far Short', 'far_short', 'Far Shot'),
                                getVal('Warm Family', 'warm_family'),
                                getVal('Modal with Book', 'modal_with_book', 'Model with Book'),
                                getVal('Rustic', 'rustic')
                            ].filter(url => url && typeof url === 'string' && url.trim() !== '').map(url => url.trim()),
                            videos: [getVal('Sponge Wash Video', 'sponge_wash_video', 'Wash Video')].filter(url => url && typeof url === 'string' && url.trim() !== '').map(url => url.trim()),
                            category_names: getVal('Category Names', 'Categories', 'category_names') ? String(getVal('Category Names', 'Categories', 'category_names')).split(',').map(name => name.trim()) : [],
                            group_names: getVal('Group Names', 'Groups', 'group_names') ? String(getVal('Group Names', 'Groups', 'group_names')).split(',').map(name => name.trim()) : []
                        };
                    });

                    console.log('Bulk Uploading formatted data:', formattedData);
                    const res = await api.post('/wallpapers/bulk-upload', { wallpapers: formattedData });
                    setResults(res.data.summary);
                    onRefresh();
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setUploading(false);
                }
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide bulk-upload-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="title-with-icon">
                        <Upload size={24} className="text-primary" />
                        <h2>Bulk Wallpaper Upload</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body">
                    {!results ? (
                        <>
                            <div className="upload-instructions mb-6">
                                <h3>Instructions</h3>
                                <ul>
                                    <li>Download the CSV template to ensure correct column headers.</li>
                                    <li>Provide <strong>Name</strong> and <strong>Design Code</strong> for every row.</li>
                                    <li><strong>Images</strong> and <strong>Videos</strong> should be comma-separated URLs.</li>
                                    <li><strong>Category/Group Names</strong> should be exactly as they appear in the Admin Panel.</li>
                                    <li>Files must be in <code>.csv</code> format.</li>
                                </ul>
                                <button className="btn btn-outline-primary btn-sm mt-3" onClick={handleDownloadTemplate}>
                                    <Download size={16} />
                                    <span>Download CSV Template</span>
                                </button>
                            </div>

                            <div className={`drop-zone ${file ? 'has-file' : ''}`}>
                                <input type="file" accept=".csv" onChange={handleFileChange} id="csv-upload" />
                                <label htmlFor="csv-upload">
                                    <FileSpreadsheet size={48} className={file ? 'text-primary' : 'text-muted'} />
                                    {file ? (
                                        <div className="file-info">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                                        </div>
                                    ) : (
                                        <span>Click or drag CSV file here to upload</span>
                                    )}
                                </label>
                            </div>

                            {preview.length > 0 && (
                                <div className="preview-section mt-6">
                                    <h3>Data Preview (First 5 rows)</h3>
                                    <div className="preview-table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    {Object.keys(preview[0]).slice(0, 6).map(header => (
                                                        <th key={header}>{header}</th>
                                                    ))}
                                                    <th>...</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.map((row, idx) => (
                                                    <tr key={idx}>
                                                        {Object.values(row).slice(0, 6).map((val, i) => (
                                                            <td key={i}>{val}</td>
                                                        ))}
                                                        <td>...</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger mt-4">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="upload-results">
                            <div className="results-header">
                                <CheckCircle2 size={48} className="text-success" />
                                <div className="text-center">
                                    <h3>Upload Completed</h3>
                                    <p>Your bulk upload process has finished.</p>
                                </div>
                            </div>

                            <div className="results-summary">
                                <div className="summary-card success">
                                    <span className="count">{results.success}</span>
                                    <span className="label">Successfully Created</span>
                                </div>
                                <div className="summary-card failed">
                                    <span className="count">{results.failed}</span>
                                    <span className="label">Failed Rows</span>
                                </div>
                            </div>

                            {results.errors.length > 0 && (
                                <div className="error-list mt-6">
                                    <h4>Error Details</h4>
                                    <div className="error-items">
                                        {results.errors.map((err, idx) => (
                                            <div key={idx} className="error-item">
                                                <code>{err.design_code || 'Unknown row'}</code>
                                                <span>{err.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="btn btn-primary full-width mt-6" onClick={onClose}>
                                Finish & Close
                            </button>
                        </div>
                    )}
                </div>

                <footer className="modal-footer">
                    {!results && (
                        <>
                            <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={!file || uploading}>
                                {uploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        <span>Start Bulk Upload</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </footer>
            </div>

            <style>{`
                .bulk-upload-modal { max-width: 800px; }
                .title-with-icon { display: flex; align-items: center; gap: 0.75rem; }
                .title-with-icon h2 { margin: 0; }
                
                .upload-instructions h3 { font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.75rem; }
                .upload-instructions ul { list-style: disc; padding-left: 1.25rem; font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; }
                
                .drop-zone { 
                    border: 2px dashed var(--border-color); 
                    border-radius: 1rem; 
                    padding: 3rem 2rem; 
                    text-align: center; 
                    background: var(--bg-input);
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .drop-zone:hover, .drop-zone.has-file { border-color: var(--primary); background: rgba(59, 130, 246, 0.05); }
                .drop-zone input { display: none; }
                .drop-zone label { cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                
                .file-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .file-name { font-weight: 600; color: var(--text-main); }
                .file-size { font-size: 0.75rem; color: var(--text-muted); }
                
                .preview-section h3 { font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-dim); }
                .preview-table-wrapper { overflow-x: auto; background: var(--bg-card); border-radius: 0.5rem; border: 1px solid var(--border-color); }
                .preview-table-wrapper table { font-size: 0.75rem; width: 100%; border-collapse: collapse; }
                .preview-table-wrapper th, .preview-table-wrapper td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
                .preview-table-wrapper th { background: var(--bg-header-bar); font-weight: 600; color: var(--text-dim); }
                
                .upload-results { padding: 1rem 0; }
                .results-header { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 2.5rem; }
                .results-header h3 { font-size: 1.5rem; margin: 0; }
                .results-header p { color: var(--text-muted); margin: 0; }
                
                .results-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .summary-card { padding: 1.5rem; border-radius: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
                .summary-card.success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); }
                .summary-card.failed { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
                .summary-card .count { font-size: 2rem; font-weight: 700; }
                .summary-card.success .count { color: #22c55e; }
                .summary-card.failed .count { color: #ef4444; }
                .summary-card .label { font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05rem; }
                
                .error-list { border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
                .error-list h4 { font-size: 0.875rem; color: var(--text-dim); margin-bottom: 1rem; }
                .error-items { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; }
                .error-item { display: flex; gap: 1rem; align-items: flex-start; padding: 0.75rem; background: var(--bg-input); border-radius: 0.5rem; font-size: 0.8125rem; }
                .error-item code { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 0.1rem 0.4rem; border-radius: 0.25rem; font-weight: 600; }
                .error-item span { color: var(--text-muted); }
                
                .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; }
                .alert-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default BulkUploadModal;
