import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVisualizationHistory, fetchGroups, fetchCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import '../styles/App.css';
import '../styles/CatalogLayout.css';

const TryItOn = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [groupsData, categoriesData] = await Promise.all([fetchGroups(), fetchCategories()]);
                setGroups(groupsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error('Error loading sidebar data:', err);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const loadHistory = async () => {
            if (!user) { setLoading(false); return; }
            try {
                const data = await fetchVisualizationHistory();
                setHistory(data);
            } catch (err) {
                console.error("Error fetching visualizer history:", err);
                setError("Failed to load your past designs.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [user]);

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '10rem 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Loading your design history...</div>;

    if (!user) {
        return (
            <div className="catalog-page fade-in-up">
                <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                    <SidebarLeft
                        breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'ROOM TRIES' }]}
                        groups={groups}
                        selectedGroupIds={selectedGroupIds}
                        onToggleGroup={(id) => setSelectedGroupIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        onToggleCategory={(id) => setSelectedCategoryIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                        showFilters={true}
                    />

                    <div className="col-main-content">
                        <div className="try-it-on-page" style={{ padding: '4rem 1rem' }}>
                            <header className="page-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2.5rem', fontFamily: "'Playfair Display', serif" }}>My Room Tries</h2>
                                <p style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Login to see your saved AI room transformations.</p>
                            </header>
                            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                                <Link to="/login" className="btn-zara-solid" style={{ textDecoration: 'none', padding: '1.25rem 3rem' }}>Login to View History</Link>
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
            </div>
        );
    }

    return (
        <div className="catalog-page fade-in-up">
            <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                <SidebarLeft
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'ROOM TRIES' }]}
                    groups={groups}
                    selectedGroupIds={selectedGroupIds}
                    onToggleGroup={(id) => setSelectedGroupIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onToggleCategory={(id) => setSelectedCategoryIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                    showFilters={true}
                />

                <div className="col-main-content">
                    <div className="try-it-on-page" style={{ padding: '0' }}>
                        <header className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '3.5rem', fontFamily: "'Playfair Display', serif", marginBottom: '1rem', letterSpacing: '-0.02em' }}>AI Room Visualizer</h2>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#888' }}>See Stenna designs on your own walls in seconds.</p>
                        </header>

                        <div className="info-section" style={{ padding: '3rem', marginBottom: '4rem', background: '#fcfcfc', border: '1px solid #f0f0f0' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '0.75rem', letterSpacing: '0.2rem', textTransform: 'uppercase' }}>How it Works</h3>
                            <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                                <div className="step" style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>01</div>
                                    <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>PICK DESIGN</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: '1.6' }}>Find a wallpaper you love in our curated catalog.</p>
                                </div>
                                <div className="step" style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>02</div>
                                    <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>UPLOAD ROOM</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: '1.6' }}>Take a photo of your room and upload it via the 'Try on Wall' button.</p>
                                </div>
                                <div className="step" style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>03</div>
                                    <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>AI TRANSFORMATION</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: '1.6' }}>Our AI perfectly applies the design to your walls with realistic lighting.</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                            <Link to="/catalog" className="btn-zara-solid" style={{ textDecoration: 'none', padding: '1.25rem 4rem', fontSize: '0.8rem', display: 'inline-block' }}>EXPLORE CATALOG</Link>
                        </div>

                        <div className="history-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #000', paddingBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recent Transformations</h3>
                                <span style={{ fontSize: '0.7rem', color: '#888' }}>{history.length} SAVED TRIES</span>
                            </div>

                            {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                            {history.length > 0 ? (
                                <div className="grid grid-cols-3" style={{ gap: '20px' }}>
                                    {history.map((item) => (
                                        <div key={item.id} className="card" style={{ border: 'none', background: 'transparent' }}>
                                            <div style={{ position: 'relative', height: '350px', marginBottom: '1rem' }}>
                                                <img src={item.generated_image_url} alt="AI Visualization" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ padding: '0' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.wallpapers?.name || 'Stenna Design'}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.65rem', color: '#888' }}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <Link to={`/wallpaper/${item.wallpapers?.slug}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#000', fontWeight: '800' }}>VIEW ARTWORK →</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '4rem', textAlign: 'center', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}><p>No designs saved yet. Be the first to try!</p></div>
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
        </div>
    );
};

export default TryItOn;
