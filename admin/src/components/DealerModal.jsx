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
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content admin-modal-standard" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2 className="admin-modal-title">{dealer ? 'Edit Dealer' : 'Add New Dealer'}</h2>
                    <button className="admin-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-modal-form">
                    <div className="admin-modal-body">
                        <div className="admin-form-grid">
                            <div className="admin-field full">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. John Doe Decorators"
                                />
                            </div>

                            <div className="admin-field full">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={!!dealer}
                                    placeholder="dealer@example.com"
                                />
                            </div>

                            <div className="admin-field full">
                                <label>Password {dealer && '(Leave blank to keep current)'}</label>
                                <div className="admin-password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!dealer}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="admin-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="admin-field full">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div className="admin-field full">
                                <label>Shop Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Full commercial address..."
                                />
                            </div>

                            <div className="admin-field full">
                                <label className="admin-checkbox-field">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <span>Active Status (Authorized to use portal)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="admin-btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn primary">
                            <Save size={18} />
                            <span>{dealer ? 'Update Dealer' : 'Create Dealer'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DealerModal;
