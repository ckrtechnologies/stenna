import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ChevronLeft, ArrowRight } from 'lucide-react-native';
import { aiApi } from '../services/api';

const { width } = Dimensions.get('window');
const columnWidth = (width - 60) / 2;

const AIRecommendationScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        roomType: '',
        mood: '',
        style: '',
        colors: '',
        lighting: ''
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [imageErrors, setImageErrors] = useState({});

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

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const handleOptionSelect = (option) => {
        const currentQuestion = questions[step];
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
        try {
            const response = await aiApi.getRecommendations(finalAnswers);
            setResults(response.data);
        } catch (error) {
            console.error('Fetch recommendations error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setStep(0);
        setAnswers({
            roomType: '',
            mood: '',
            style: '',
            colors: '',
            lighting: ''
        });
        setResults(null);
    };

    const getImageUrl = (item) => {
        if (!item.images || item.images.length === 0) {
            return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        }
        const url = item.images[0].image_url;
        if (!url) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        if (url.startsWith('http')) return url;
        return `https://jatwtohvdfvundhoigox.supabase.co/storage/v1/object/public/wallpapers/${url}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color="#000" size="large" />
                <Text style={styles.loadingText}>STENNA AI IS CURATING YOUR COLLECTION</Text>
                <Text style={styles.subLoadingText}>Analyzing {answers.style} trends and {answers.mood?.toLowerCase()} palettes</Text>
            </SafeAreaView>
        );
    }

    if (results) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <FlatList
                    ListHeaderComponent={() => (
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsTitle}>YOUR PERSONALIZED COLLECTION</Text>
                            <Text style={styles.resultsSummary}>{results.summary}</Text>
                            <Text style={styles.resultsDescription}>{results.description}</Text>
                            <TouchableOpacity style={styles.retakeBtn} onPress={resetQuiz}>
                                <Text style={styles.retakeBtnText}>RETAKE QUIZ</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    data={results.recommendations}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('WallpaperDetail', { slug: item.slug })}
                        >
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{
                                        uri: imageErrors[item.id]
                                            ? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80'
                                            : getImageUrl(item)
                                    }}
                                    style={styles.image}
                                    onError={() => handleImageError(item.id)}
                                />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>AI RECOMMENDATION</Text>
                                </View>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.name} numberOfLines={1}>{item.name?.toUpperCase()}</Text>
                                <Text style={styles.designCode}>{item.design_code}</Text>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.price}>₹ {item.price}</Text>
                                    <TouchableOpacity
                                        style={styles.tryOnMiniBtn}
                                        onPress={() => navigation.navigate('AppContent', {
                                            screen: 'MainTabs',
                                            params: {
                                                screen: 'VisualizerTab',
                                                params: { wallpaperId: item.id }
                                            }
                                        })}
                                    >
                                        <Sparkles size={10} color="#000" />
                                        <Text style={styles.tryOnMiniText}>TRY ON</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.list}
                />
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[step];

    return (
        <SafeAreaView style={styles.quizContainer} edges={['top', 'bottom']}>
            <View style={styles.quizHeader}>
                <Text style={styles.quizTitle}>THE AI DESIGNER</Text>
                <Text style={styles.quizSubtitle}>CURATED VIBES FOR YOUR SPACE IN 5 QUESTIONS</Text>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                    <Text style={styles.stepIndicator}>STEP {step + 1} OF {questions.length}</Text>
                    <Text style={styles.percentageText}>{Math.round(((step + 1) / questions.length) * 100)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${((step + 1) / questions.length) * 100}%` }]} />
                </View>
            </View>

            <View style={styles.questionBlock}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>

                <View style={styles.optionsGrid}>
                    {currentQuestion.options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.optionBtn}
                            onPress={() => handleOptionSelect(option)}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                            <ArrowRight size={16} color="#000" style={{ opacity: 0.3 }} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {step > 0 && (
                <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backQuizBtn}>
                    <Text style={styles.backQuizText}>← PREVIOUS</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    quizContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 25,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 40,
    },
    loadingText: {
        marginTop: 30,
        fontSize: 16,
        fontFamily: 'serif',
        textAlign: 'center',
        letterSpacing: 1,
    },
    subLoadingText: {
        marginTop: 10,
        fontSize: 10,
        letterSpacing: 2,
        color: '#888',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    quizHeader: {
        marginTop: 40,
        marginBottom: 50,
        alignItems: 'center',
    },
    quizTitle: {
        fontSize: 28,
        fontFamily: 'serif',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    quizSubtitle: {
        fontSize: 9,
        color: '#888',
        letterSpacing: 2,
        textAlign: 'center',
    },
    progressSection: {
        marginBottom: 60,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    stepIndicator: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    percentageText: {
        fontSize: 11,
        color: '#888',
    },
    progressBarBg: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
    },
    progressBarFill: {
        height: 1,
        backgroundColor: '#000',
    },
    questionBlock: {
        flex: 1,
    },
    questionText: {
        fontSize: 32,
        fontFamily: 'serif',
        lineHeight: 40,
        marginBottom: 40,
    },
    optionsGrid: {
        gap: 12,
    },
    optionBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 2,
    },
    optionText: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    backQuizBtn: {
        marginTop: 40,
        marginBottom: 40,
        alignSelf: 'flex-start',
    },
    backQuizText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        color: '#888',
    },
    resultsHeader: {
        padding: 30,
        alignItems: 'center',
    },
    resultsTitle: {
        fontSize: 24,
        fontFamily: 'serif',
        textAlign: 'center',
        marginBottom: 20,
    },
    resultsSummary: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 8,
        marginBottom: 20,
        textAlign: 'center',
    },
    resultsDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: '#444',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 30,
    },
    retakeBtn: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 2,
    },
    retakeBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
    list: {
        paddingHorizontal: 15,
        paddingBottom: 40,
    },
    card: {
        width: columnWidth,
        marginBottom: 30,
        marginHorizontal: 10,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: columnWidth * 1.4,
        backgroundColor: '#f8f8f8',
        borderRadius: 2,
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#fff',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },
    cardInfo: {
        marginTop: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    tryOnMiniBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    tryOnMiniText: {
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    name: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    designCode: {
        fontSize: 9,
        color: '#999',
        marginBottom: 6,
    },
    price: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default AIRecommendationScreen;
