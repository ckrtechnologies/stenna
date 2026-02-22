import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import { fetchUserQueries } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyQueries = () => {
    const { user } = useAuth();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQueries = async () => {
            if (!user) return;
            try {
                const data = await fetchUserQueries(user.id);
                setQueries(data);
            } catch (error) {
                console.error("Error fetching queries:", error);
            } finally {
                setLoading(false);
            }
        };
        loadQueries();
    }, [user]);

    if (loading) return <div className="loading">Loading your inquiries...</div>;

    return (
        <div className="queries-page">
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <h2>My Inquiries</h2>
                <p>Track your inquiries and follow up with dealers for Stenna Wallpapers.</p>
            </header>

            <div className="card overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#e2e3ebff', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Product/Enquiry</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queries.map(q => (
                            <tr key={q.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {/* <td style={{ padding: '1rem' }}>#{q.id.slice(0, 5)}</td> */}
                                <td style={{ padding: '1rem' }}>
                                    {new Date(q.created_at).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true
                                    })}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        {q.wallpaper?.name || 'Wallpaper Enquiry'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {q.message}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        background: q.status === 'new' ? '#fff7ed' : '#f0f9ff',
                                        color: q.status === 'new' ? '#c2410c' : '#0369a1',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {q.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {queries.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No queries found. Start browsing the catalog to send your first inquiry!
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyQueries;
