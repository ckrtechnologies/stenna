import React, { useState } from 'react';
import { submitEnquiry } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EnquiryModal = ({ isOpen, onClose, wallpaper }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await submitEnquiry({
                ...formData,
                wallpaper_id: wallpaper.id,
                user_id: user?.id,
                message: formData.message
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to submit enquiry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>&times;</button>

                <h3>Enquire for Quote</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Interested in <strong>{wallpaper?.name}</strong>? Fill out the form below and our team will get back to you with a personalized quote.
                </p>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h4>Enquiry Sent!</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>Thank you for your interest. We will contact you shortly.</p>
                        <button className="filter-btn active" style={{ marginTop: '1.5rem' }} onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 ..." />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Custom Requirements </label>
                            <textarea
                                name="message"
                                rows="3"
                                value={formData.message}
                                required
                                onChange={handleChange}
                                placeholder="Tell us about your room size or specific needs..."
                            />
                        </div>

                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                        <button
                            type="submit"
                            className="btn-glowing"
                            style={{ padding: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Sending Request...' : 'Submit Enquiry'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EnquiryModal;
