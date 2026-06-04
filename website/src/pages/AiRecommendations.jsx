import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAiRecommendations, fetchGroups, fetchCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { 
    Sofa, Bed, Monitor, Smile, Utensils, Bath, ChefHat, DoorClosed,
    Sun, SunDim, Lightbulb, Paintbrush, Circle, Trees, Layers, Sparkles,
    Heart, Coffee, CloudMoon, Wind, Palette, Shield, Compass, Rocket
} from 'lucide-react';
import '../styles/App.css';
import '../styles/CatalogLayout.css';

const optionMetadata = {
    // Rooms
    'Living Room': { icon: Sofa, color: '#b45309', bgColor: '#fef3c7' },
    'Bedroom': { icon: Bed, color: '#4f46e5', bgColor: '#e0e7ff' },
    'Office': { icon: Monitor, color: '#0369a1', bgColor: '#e0f2fe' },
    'Kids Room/Nursery': { icon: Smile, color: '#db2777', bgColor: '#fce7f3' },
    'Dining Room': { icon: Utensils, color: '#047857', bgColor: '#d1fae5' },
    'Bathroom': { icon: Bath, color: '#0d9488', bgColor: '#ccfbf1' },
    'Kitchen': { icon: ChefHat, color: '#ea580c', bgColor: '#ffedd5' },
    'Entryway/Hallway': { icon: DoorClosed, color: '#7c2d12', bgColor: '#ffedd5' },

    // Lighting
    'Flooded with light (Tons of natural light)': { icon: Sun, color: '#eab308', bgColor: '#fef9c3' },
    'Moderate/Some natural light': { icon: SunDim, color: '#f97316', bgColor: '#ffedd5' },
    'Barely any natural light (mostly artificial)': { icon: Lightbulb, color: '#64748b', bgColor: '#f1f5f9' },

    // Furniture
    'White/Light Neutrals': { icon: Paintbrush, color: '#0f172a', bgColor: '#f1f5f9' },
    'Black/Dark Neutrals': { icon: Circle, color: '#000000', bgColor: '#e2e8f0' },
    'Warm Wood Tones': { icon: Trees, color: '#854d0e', bgColor: '#fef9c3' },
    'Cool/Grey Wood Tones': { icon: Layers, color: '#475569', bgColor: '#f1f5f9' },
    'Starting Fresh/Blank Canvas': { icon: Sparkles, color: '#7c3aed', bgColor: '#f3e8ff' },

    // Vibes
    'Calm & Peaceful (Serene)': { icon: Heart, color: '#059669', bgColor: '#d1fae5' },
    'Cozy & Warm (Comforting)': { icon: Coffee, color: '#d97706', bgColor: '#fef3c7' },
    'Moody & Dramatic (Atmospheric)': { icon: CloudMoon, color: '#1e1b4b', bgColor: '#e0e7ff' },
    'Airy & Fresh (Bright)': { icon: Wind, color: '#06b6d4', bgColor: '#ecfeff' },
    'Bold & Creative (Vibrant)': { icon: Palette, color: '#db2777', bgColor: '#fce7f3' },

    // Adventure
    'Very safe (soft neutrals & subtle textures)': { icon: Shield, color: '#16a34a', bgColor: '#d1fae5' },
    'Moderately adventurous (elegant muted color tones)': { icon: Compass, color: '#2563eb', bgColor: '#dbeafe' },
    'Bold & Creative (vibrant hues & rich deep patterns)': { icon: Rocket, color: '#dc2626', bgColor: '#fee2e2' }
};

const AiRecommendations = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ roomType: '', lighting: '', furnitureColor: '', vibe: '', adventureLevel: '' });
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
            options: ['Living Room', 'Bedroom', 'Office', 'Kids Room/Nursery', 'Dining Room', 'Bathroom', 'Kitchen', 'Entryway/Hallway']
        },
        {
            key: 'lighting',
            question: "How much natural light does the room get?",
            options: ['Flooded with light (Tons of natural light)', 'Moderate/Some natural light', 'Barely any natural light (mostly artificial)']
        },
        {
            key: 'furnitureColor',
            question: "What colors are in your existing furniture, wood, or trim?",
            options: ['White/Light Neutrals', 'Black/Dark Neutrals', 'Warm Wood Tones', 'Cool/Grey Wood Tones', 'Starting Fresh/Blank Canvas']
        },
        {
            key: 'vibe',
            question: "Select the primary vibe you want to achieve:",
            options: ['Calm & Peaceful (Serene)', 'Cozy & Warm (Comforting)', 'Moody & Dramatic (Atmospheric)', 'Airy & Fresh (Bright)', 'Bold & Creative (Vibrant)']
        },
        {
            key: 'adventureLevel',
            question: "How adventurous are you feeling with color?",
            options: ['Very safe (soft neutrals & subtle textures)', 'Moderately adventurous (elegant muted color tones)', 'Bold & Creative (vibrant hues & rich deep patterns)']
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
            setError(err.message || "Stenna AI encountered a wrinkle. Please try again.");
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

    if (!user) {
        return (
            <div className="catalog-page fade-in-up">
                <div className="desktop-layout-container" style={{ paddingTop: '0' }}>
                    <SidebarLeft
                        breadcrumb={[{ label: 'HOME', path: '/' }, { label: 'AI DESIGNER' }]}
                        {...sidebarProps}
                    />
                    <div className="col-main-content">
                        <div className="recommendations-page" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                            <header className="page-header" style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontFamily: "'Playfair Display', serif" }}>The AI Designer</h2>
                                <p style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Login to get personalized AI wallpaper recommendations.</p>
                            </header>
                            <div style={{ marginTop: '4rem' }}>
                                <Link to="/login" className="btn-zara-solid" style={{ textDecoration: 'none', padding: '1.25rem 3rem' }}>Login to Start Quiz</Link>
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
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#888' }}>Analyzing your {answers.roomType?.toLowerCase()} with {answers.vibe?.toLowerCase()} vibes</p>
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
                                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 5 }}>AI RECOMMENDATION</div>
                                                    {(item.groups?.some(g => g.name?.toLowerCase() === 'new') || 
                                                      item.categories?.some(c => c.name?.toLowerCase() === 'new')) && (
                                                        <span className="new-arrival-badge">NEW</span>
                                                    )}
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
                                <div className="zara-options-grid">
                                    {currentQuestion.options.map((option) => {
                                        const meta = optionMetadata[option];
                                        const IconComponent = meta ? meta.icon : Sparkles;
                                        const iconColor = meta ? meta.color : '#000000';
                                        const iconBg = meta ? meta.bgColor : '#f3f4f6';

                                        return (
                                            <button key={option} className="zara-option-btn" onClick={() => handleOptionSelect(option)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                                    <div className="option-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '10px', backgroundColor: iconBg, flexShrink: 0 }}>
                                                        <IconComponent size={20} color={iconColor} />
                                                    </div>
                                                    <span className="option-text" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.1em', color: '#1e293b' }}>
                                                        {option}
                                                    </span>
                                                </div>
                                                <span className="option-arrow">→</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {step > 0 && <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: '#888', marginTop: '3rem', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0' }}>← Previous</button>}
                            </div>
                        </div>

                        <style>{`
                            .zara-options-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 1.25rem;
                                width: 100%;
                            }
                            @media (max-width: 768px) {
                                .zara-options-grid {
                                    grid-template-columns: 1fr;
                                    gap: 1rem;
                                }
                            }
                            .zara-option-btn {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                width: 100%;
                                padding: 1.25rem 1.5rem;
                                background: #ffffff;
                                border: 1px solid #e2e8f0;
                                border-radius: 12px;
                                text-align: left;
                                cursor: pointer;
                                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                            }
                            .zara-option-btn:hover {
                                border-color: #0f172a !important;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                                transform: translateY(-2px);
                            }
                            .zara-option-btn:hover .option-arrow {
                                transform: translateX(4px);
                                color: #0f172a;
                            }
                            .option-arrow {
                                font-size: 1.25rem;
                                color: #94a3b8;
                                transition: all 0.25s ease;
                                margin-left: 0.5rem;
                            }
                            @keyframes fadeInUp {
                                from {
                                    opacity: 0;
                                    transform: translateY(20px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                        `}</style>
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
