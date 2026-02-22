import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { wallpaperApi } from '../services/api';

const { width } = Dimensions.get('window');

const AIRecommendation = ({ currentWallpaperId, title = "AI CURATED FOR YOU" }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});
    const navigation = useNavigation();

    useEffect(() => {
        fetchRecommendations();
    }, [currentWallpaperId]);

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const fetchRecommendations = async () => {
        try {
            // In a real AI implementation, this would call a recommendation engine
            // For now, we fetch all wallpapers and filter/shuffle
            const response = await wallpaperApi.getAll({ limit: 6 });
            const filtered = response.data.filter(w => w.id !== currentWallpaperId);
            setRecommendations(filtered.sort(() => 0.5 - Math.random()).slice(0, 4));
        } catch (error) {
            console.error('Fetch recommendations error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (item) => {
        if (!item.images || item.images.length === 0) {
            // High-end fallback for wallpapers
            return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        }
        const url = item.images[0].image_url;
        if (!url) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        if (url.startsWith('http')) return url;
        return `https://jatwtohvdfvundhoigox.supabase.co/storage/v1/object/public/wallpapers/${url}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Sparkles size={16} color="#000" />
                <Text style={styles.title}>{title}</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {recommendations.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}
                        onPress={() => navigation.navigate('WallpaperDetail', { slug: item.slug })}
                    >
                        <Image
                            source={{
                                uri: imageErrors[item.id]
                                    ? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80'
                                    : getImageUrl(item)
                            }}
                            style={styles.image}
                            onError={() => handleImageError(item.id)}
                        />
                        <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={1}>{item.name?.toUpperCase()}</Text>
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
                                    <Sparkles size={8} color="#000" />
                                    <Text style={styles.tryOnMiniText}>TRY ON</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('RecommendationTab')}
            >
                <Text style={styles.actionBtnText}>START AI DESIGNER</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 40,
        paddingHorizontal: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: 15,
    },
    card: {
        width: width * 0.4,
        marginHorizontal: 5,
    },
    image: {
        width: '100%',
        height: width * 0.5,
        backgroundColor: '#f8f8f8',
        borderRadius: 2,
    },
    info: {
        marginTop: 10,
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
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 2,
    },
    tryOnMiniText: {
        fontSize: 7,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    name: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
    },
    price: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtn: {
        marginTop: 30,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#000',
        paddingVertical: 15,
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 3,
    },
});

export default AIRecommendation;
