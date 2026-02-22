import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="profile-page" style={{ maxWidth: '800px', margin: '4rem auto' }}>
            <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Account Management</h1>
                <p>Manage your Stenna profile, settings and security preferences.</p>
            </header>

            <div className="grid grid-cols-2">
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Profile Details</h3>
                    <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                        <div className="detail-group">
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Stored Email</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{user.email}</div>
                        </div>
                        <div className="detail-group">
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Display Name</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.user_metadata?.full_name || 'Stenna Curator'}</div>
                        </div>
                        <button className="filter-btn" style={{ marginTop: '0.5rem', width: 'fit-content' }}>Edit Information</button>
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Security & Login</h3>
                    <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                        <div className="detail-group">
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Last login detected</label>
                            <div style={{ fontWeight: '500' }}>{new Date(user.last_sign_in_at).toLocaleDateString()} at {new Date(user.last_sign_in_at).toLocaleTimeString()}</div>
                        </div>
                        <div className="detail-group">
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Auth Method</label>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary-color)' }}>{user.app_metadata?.provider || 'Secure Email'}</div>
                        </div>
                        <button className="filter-btn" style={{ marginTop: '0.5rem', width: 'fit-content' }}>Security Settings</button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fefce8', borderColor: '#fef08a' }}>
                <div>
                    <h4 style={{ margin: 0, color: '#854d0e' }}>Data Privacy</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#a16207' }}>Your data is securely managed by Supabase Authentication services.</p>
                </div>
                <button className="filter-btn" style={{ color: '#854d0e', background: 'transparent' }}>Download Data</button>
            </div>
        </div>
    );
};

export default Profile;
