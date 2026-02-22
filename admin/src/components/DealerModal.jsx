import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';

const DealerModal = ({ isOpen, onClose, onSave, dealer }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        is_active: true
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (dealer) {
            setFormData({
                name: dealer.name || '',
                email: dealer.email || '',
                password: '', // Don't show existing password
                phone: dealer.phone || '',
                address: dealer.address || '',
                is_active: dealer.is_active
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                address: '',
                is_active: true
            });
        }
    }, [dealer, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{dealer ? 'Edit Dealer' : 'Add New Dealer'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={!!dealer} // Prevent email change for now or allow if backend supports it
                        />
                    </div>

                    <div className="form-group">
                        <label>Password {dealer && '(Leave blank to keep current)'}</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!dealer} // Required only for new dealers
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <span>Active Status</span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} />
                            <span>{dealer ? 'Update Dealer' : 'Create Dealer'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
                .modal-content { background: var(--bg-card); border-radius: 1rem; border: 1px solid var(--border-color); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: scaleIn 0.2s ease-out; }
                .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
                .modal-header h2 { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin: 0; }
                .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-main); }
                
                .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--text-main); }
                .form-group input, .form-group textarea { background: var(--bg-input); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 0.5rem; color: var(--text-main); font-size: 0.9375rem; transition: border-color 0.2s; outline: none; }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); }
                
                .checkbox-group { margin-top: 0.5rem; }
                .checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
                .checkbox-label input[type="checkbox"] { width: 1.25rem; height: 1.25rem; border-radius: 0.25rem; accent-color: var(--primary); }
                .checkbox-label span { font-size: 0.9375rem; color: var(--text-main); }

                .password-input-wrapper { position: relative; }
                .password-input-wrapper input { width: 100%; padding-right: 2.5rem; }
                .toggle-password { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; }
                .toggle-password:hover { color: var(--text-main); }

                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default DealerModal;
