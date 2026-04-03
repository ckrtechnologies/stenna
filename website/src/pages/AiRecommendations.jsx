import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAiRecommendations, fetchGroups, fetchCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import '../styles/App.css';
import '../styles/CatalogLayout.css';

const AiRecommendations = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ roomType: '', mood: '', colors: '', lighting: '', style: '' });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

    useEffect(() => {
        const loadSidebarData = async () => {
            try {
                const [g, c] = await Promise.all([fetchGroups(), fetchCategories()]);
                setGroups(g);
                setCategories(c);
            } catch (err) {
                console.error('Error loading sidebar data:', err);
            }
        };
        loadSidebarData();
    }, []);

    const sidebarProps = {
        groups,
        selectedGroupIds,
        onToggleGroup: (id) => setSelectedGroupIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]),
        categories,
        selectedCategoryIds,
        onToggleCategory: (id) => setSelectedCategoryIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]),
        showFilters: true,
    };

    const questions = [
        {
            key: 'roomType',
            question: "Which room are we designing for?",
            options: ['Living Room', 'Bedroom', 'Office', 'Kids Room', 'Dining Room']
        },
        {
            key: 'mood',
            question: "What vibe do you want to create?",
            options: ['Calm & Peaceful', 'Energizing & Bright', 'Cozy & Professional', 'Luxurious & Bold', 'Playful & Fun']
        },
        {
            key: 'style',
            question: "Choose your favorite design aesthetic:",
            options: ['Modern Minimalist', 'Classic Elegance', 'Industrial Chic', 'Bohemian Soul', 'Scandinavian']
        },
        {
            key: 'colors',
            question: "What's your preferred color palette?",
            options: ['Soft Pastels', 'Earth Tones', 'Monochrome (B&W)', 'Rich Jewel Tones', 'Vibrant Primary']
        },
        {
            key: 'lighting',
            question: "How much natural light does the room get?",
            options: ['Flooded with light', 'Moderate', 'Mostly artificial light']
        }
    ];

    const currentQuestion = questions[step];

    const handleOptionSelect = (option) => {
        const updatedAnswers = { ...answers, [currentQuestion.key]: option };
        setAnswers(updatedAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit(updatedAnswers);
        }
    };

    const handleSubmit = async (finalAnswers) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAiRecommendations(finalAnswers);
            setResults(data);
        } catch (err) {
            console.error(err);
            setError("Stenna AI encountered a wrinkle. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setStep(0);
        setAnswers({});
        setResults(null);
        setError(null);
    };

    if (loading) {
        return (
            <div className="catalog-page fade-in-up">
                <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                    <SidebarLeft
                        breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'AI DESIGNER' }]}
                        {...sidebarProps}
                    />
                    <div className="col-main-content">
                        <div className="recommendations-page" style={{ textAlign: 'center', padding: '120px 5%', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '1px solid #eee', borderTop: '1px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' }}></div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', letterSpacing: '0.05em', marginBottom: '1rem' }}>Stenna AI is curating your collection</h3>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#888' }}>Analyzing {answers.style} trends and {answers.mood?.toLowerCase()} palettes</p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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

    if (results) {
        return (
            <div className="catalog-page fade-in-up">
                <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                    <SidebarLeft
                        breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'AI DESIGNER' }]}
                        {...sidebarProps}
                    />

                    {/* COLUMN 2: CONTENT */}
                    <div className="col-main-content">
                        <div className="recommendations-page" style={{ padding: '0' }}>
                            <header style={{ textAlign: 'center', marginBottom: '5rem', padding: '0 5%' }}>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Your Personalized Collection</h2>
                                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#000', marginBottom: '1.5rem', display: 'inline-block', borderBottom: '1px solid #000', paddingBottom: '0.5rem' }}>{results.summary}</p>
                                {results.is_fallback && (
                                    <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '1rem 0' }}>— Design Inspiration (Broad Match) —</p>
                                )}
                                <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', color: '#444', fontSize: '1rem', lineHeight: '1.8', fontStyle: 'italic' }}>{results.description}</p>
                                <button className="btn-zara-solid" onClick={resetQuiz} style={{ padding: '1rem 3rem' }}>Retake Quiz</button>
                            </header>

                            {results.recommendations?.length > 0 ? (
                                <div className="grid grid-cols-3" style={{ gap: '40px 20px', width: '100%', padding: '0 5% 5rem' }}>
                                    {results.recommendations.map((item) => (
                                        <div key={item.id} className="card product-card" style={{ border: 'none' }}>
                                            <Link to={`/wallpaper/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <div className="image-container" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                                    <img src={item.images?.[0]?.image_url || 'https://via.placeholder.com/400x533?text=Stenna+Design'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI RECOMMENDATION</div>
                                                </div>
                                                <div className="product-info" style={{ textAlign: 'left' }}>
                                                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: '600' }}>{item.name}</h3>
                                                    <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{item.design_code}</p>
                                                    {item.tagline && <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#333', lineHeight: '1.4' }}>"{item.tagline}"</p>}
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '100px 5%', textAlign: 'center' }}>
                                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '2rem' }}>We couldn't find an exact match for this specific aesthetic.</p>
                                    <button className="btn-zara-solid" onClick={resetQuiz}>Try Different Preferences</button>
                                </div>
                            )}
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
                    breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'AI DESIGNER' }]}
                    {...sidebarProps}
                />

                {/* COLUMN 2: CONTENT */}
                <div className="col-main-content">
                    <div className="recommendations-page" style={{ padding: '0' }}>
                        <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>The AI Designer</h2>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#888' }}>Curated vibes for your space in 5 questions</p>
                        </header>

                        <div className="zara-quiz-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Step {step + 1} of {questions.length}</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{Math.round(((step + 1) / questions.length) * 100)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '1px', background: '#eee', marginBottom: '4rem' }}>
                                <div style={{ width: `${((step + 1) / questions.length) * 100}%`, height: '1px', background: '#000', transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                            </div>

                            <div className="question-block" style={{ animation: 'fadeInUp 0.6s ease' }}>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'left', lineHeight: '1.2' }}>{currentQuestion.question}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {currentQuestion.options.map((option) => (
                                        <button key={option} className="zara-option-btn" onClick={() => handleOptionSelect(option)} style={{ padding: '2rem 1.5rem', background: '#fff', border: '1px solid #eee', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {option}<span style={{ opacity: 0.3 }}>→</span>
                                        </button>
                                    ))}
                                </div>
                                {step > 0 && <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: '#888', marginTop: '3rem', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0' }}>← Previous</button>}
                            </div>
                        </div>

                        <style>{`.zara-option-btn:hover { border-color: #000 !important; padding-left: 2.5rem !important; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '3rem' }}>{error}</p>}
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

export default AiRecommendations;
