import { useState, useEffect } from 'react';
import { Save, Building } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const Store = () => {
    const [storeInfo, setStoreInfo] = useState({
        name: 'Stenna Wallpapers',
        email: 'contact@stenna.com',
        phone: '+91 9876543210',
        address: '123 Wall Decor St, Creative City',
        website: 'https://stenna.com',
        currency: 'INR',
        tax_rate: 18
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await api.get('/store');
                if (res.data) setStoreInfo(res.data);
            } catch (error) {
                console.error('Failed to fetch store info', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoreInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/store', storeInfo);
            alert('Store information updated successfully!');
        } catch (error) {
            alert('Failed to update store information');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader fullPage message="Loading settings..." />;

    return (
        <div className="store-page">
            <header className="page-header">
                <div>
                    <h1>Store Settings</h1>
                    <p>Manage your business information and public details.</p>
                </div>
            </header>

            <div className="settings-container">
                <form onSubmit={handleSubmit} className="settings-form">
                    <section className="settings-section">
                        <h3><Building size={18} /> Business Information</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Store Name</label>
                                <input name="name" value={storeInfo.name} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>Official Email</label>
                                <input type="email" name="email" value={storeInfo.email} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>Contact Phone</label>
                                <input name="phone" value={storeInfo.phone} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>Website URL</label>
                                <input name="website" value={storeInfo.website} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="input-group full">
                            <label>Physical Address</label>
                            <textarea name="address" value={storeInfo.address} onChange={handleChange} rows="3"></textarea>
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>Regional & Tax</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Currency Symbol</label>
                                <select name="currency" value={storeInfo.currency} onChange={handleChange}>
                                    <option value="USD">USD ($)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Tax Rate (%)</label>
                                <input type="number" name="tax_rate" value={storeInfo.tax_rate} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    <footer className="form-footer">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={18} />
                            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                        </button>
                    </footer>
                </form>
            </div>

            <style>{`
        .settings-container { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; box-shadow: var(--shadow-premium); }
        .settings-form { padding: 2rem; }
        .settings-section { margin-bottom: 3rem; }
        .settings-section h3 { 
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          color: var(--text-main); 
          margin-bottom: 1.5rem; 
          font-size: 1.125rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .input-group { margin-bottom: 1.25rem; }
        .input-group.full { grid-column: span 2; }
        .input-group label { display: block; margin-bottom: 0.5rem; color: var(--text-dim); font-size: 0.875rem; font-weight: 600; }
        .input-group input, .input-group select, .input-group textarea {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: var(--text-input);
          outline: none;
          transition: var(--transition-base);
        }
        .input-group input:focus, .input-group select:focus, .input-group textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .form-footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }
        .loading { padding: 4rem; text-align: center; color: var(--text-dim); }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .input-group.full { grid-column: auto; }
          .settings-form { padding: 1.5rem; }
        }
      `}</style>
        </div>
    );
};

export default Store;
