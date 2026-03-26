import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { fetchUserQueries } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';
import '../styles/CatalogLayout.css';

const MyQueries = () => {
    const { user } = useAuth();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '10rem 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Loading your inquiries...</div>;

    return (
        <div className="catalog-page fade-in-up">
            <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                <SidebarLeft breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'MY INQUIRIES' }]} />

                <div className="col-main-content">
                    <div className="queries-page" style={{ padding: '0 2rem 4rem' }}>
                        <header className="page-header" style={{ marginBottom: '4rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '3.5rem', fontFamily: "'Playfair Display', serif", marginBottom: '1rem', letterSpacing: '-0.02em' }}>My Inquiries</h2>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#888' }}>Track your conversations with Stenna dealers.</p>
                        </header>

                        <div className="stenna-data-table-wrapper" style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ padding: '1.25rem 1rem', width: '70px', textAlign: 'center', color: '#888', fontWeight: '600' }}>S.NO</th>
                                        <th style={{ padding: '1.25rem 1rem', fontWeight: '600' }}>DATE</th>
                                        <th style={{ padding: '1.25rem 1rem', fontWeight: '600' }}>PRODUCT / MESSAGE</th>
                                        <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: '600' }}>STATUS</th>
                                        <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: '600', width: '140px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queries.map((q, index) => (
                                        <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>{index + 1}</td>
                                            <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                                {new Date(q.created_at).toLocaleDateString('en-IN', {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                                    {q.wallpaper?.name || 'Wallpaper Enquiry'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: '1.5' }}>
                                                    {q.message}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.4rem 1rem',
                                                    fontSize: '0.65rem',
                                                    background: q.status === 'new' ? '#fff7ed' : '#f0f9ff',
                                                    color: q.status === 'new' ? '#c2410c' : '#0369a1',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {q.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {q.wallpaper?.slug && (
                                                    <Link to={`/wallpaper/${q.wallpaper.slug}`} style={{ fontSize: '0.65rem', fontWeight: '800', textDecoration: 'none', color: '#000', borderBottom: '1px solid #000' }}>
                                                        VIEW DESIGN
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {queries.length === 0 && (
                                <div style={{ padding: '5rem', textAlign: 'center', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                                    <p style={{ marginBottom: '2rem' }}>No inquiries found yet.</p>
                                    <Link to="/catalog" className="btn-zara-solid" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>Browse Catalog</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <SidebarRight 
                    user={user} 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showSearch={true} 
                />
            </div>
            <style>{`
                tr:hover { background-color: #f9fafb; }
            `}</style>
        </div>
    );
};

export default MyQueries;
