import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserCredits } from '../services/api';
import '../styles/App.css';

const Profile = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState(null);
    const [creditsLoading, setCreditsLoading] = useState(true);
    const [creditsError, setCreditsError] = useState(null);

    useEffect(() => {
        const getCredits = async () => {
            try {
                const data = await fetchUserCredits();
                setCredits(data);
            } catch (err) {
                console.error("Failed to load credits:", err);
                setCreditsError("Could not retrieve daily credit limits.");
            } finally {
                setCreditsLoading(false);
            }
        };
        if (user) {
            getCredits();
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="profile-page" style={{ maxWidth: '800px', margin: '4rem auto' }}>
            {/* Global Menu Trigger */}
            <div 
                className="menu-trigger-global" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-mega-menu'))}
                style={{ 
                    position: 'fixed', 
                    top: '30px', 
                    left: '30px', 
                    zIndex: 1000, 
                    cursor: 'pointer',
                    padding: '10px'
                }}
            >
                <div className="zara-hamburger">
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </div>

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

            {/* Daily AI Service Credits */}
            <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Daily AI Service Credits</h3>
                {creditsLoading ? (
                    <div style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading credit usage...</div>
                ) : creditsError ? (
                    <div style={{ padding: '1rem 0', fontSize: '0.85rem', color: '#ef4444' }}>{creditsError}</div>
                ) : credits ? (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                            <div>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{credits.remaining}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '0.25rem' }}>/ {credits.limit} remaining today</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {credits.hits} generations used
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ 
                                width: `${(credits.remaining / credits.limit) * 100}%`, 
                                height: '100%', 
                                background: credits.remaining > 20 ? 'var(--primary-color, #000)' : '#f59e0b', 
                                transition: 'width 0.5s ease-out' 
                            }}></div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Credits reset daily. Free daily credits are provided for AI Room Visualizations and AI recommendations.
                        </p>
                    </div>
                ) : null}
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
