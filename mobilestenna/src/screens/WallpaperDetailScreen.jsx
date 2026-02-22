import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, Sparkles } from 'lucide-react-native';
import { wallpaperApi } from '../services/api';
import AIRecommendation from '../components/AIRecommendation';
import EnquiryModal from '../components/EnquiryModal';

const { width } = Dimensions.get('window');

const WallpaperDetailScreen = ({ route, navigation }) => {
    const { slug } = route.params;
    const [wallpaper, setWallpaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

    const handleImageError = (index) => {
        setImageErrors(prev => ({ ...prev, [index]: true }));
    };

    useEffect(() => {
        fetchWallpaper();
    }, [slug]);

    const fetchWallpaper = async () => {
        try {
            const response = await wallpaperApi.getBySlug(slug);
            setWallpaper(response.data);
        } catch (error) {
            console.error('Fetch wallpaper error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        if (url.startsWith('http')) return url;
        return `https://jatwtohvdfvundhoigox.supabase.co/storage/v1/object/public/wallpapers/${url}`;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    if (!wallpaper) return null;

    const images = wallpaper.images || [];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const contentOffset = e.nativeEvent.contentOffset.x;
                            const index = Math.round(contentOffset / width);
                            setActiveImageIndex(index);
                        }}
                    >
                        {images.map((img, idx) => (
                            <Image
                                key={idx}
                                source={{
                                    uri: imageErrors[idx]
                                        ? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80'
                                        : getImageUrl(img.image_url)
                                }}
                                style={styles.galleryImage}
                                onError={() => handleImageError(idx)}
                            />
                        ))}
                        {images.length === 0 && <View style={[styles.galleryImage, { backgroundColor: '#f0f0f0' }]} />}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {images.map((_, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.dot,
                                    activeImageIndex === idx && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>

                    {/* Top Icons */}
                    <View style={styles.topIcons}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <ChevronLeft color="#000" size={24} />
                        </TouchableOpacity>
                        <View style={styles.topRightIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Share2 color="#000" size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Heart color="#000" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.name}>{wallpaper.name?.toUpperCase()}</Text>
                            <Text style={styles.code}>{wallpaper.design_code}</Text>
                        </View>
                        <Text style={styles.price}>₹ {wallpaper.price || 'N/A'}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.visualizerBtn}
                            onPress={() => navigation.navigate('AppContent', {
                                screen: 'MainTabs',
                                params: {
                                    screen: 'VisualizerTab',
                                    params: { wallpaperId: wallpaper.id }
                                }
                            })}
                        >
                            <Sparkles color="#fff" size={16} />
                            <Text style={styles.visualizerBtnText}>TRY IT ON</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.enquiryBtn}
                            onPress={() => setIsEnquiryOpen(true)}
                        >
                            <Text style={styles.enquiryBtnText}>ENQUIRE FOR QUOTE</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoSection}>
                        {wallpaper.tagline && <Text style={styles.tagline}>{wallpaper.tagline.toUpperCase()}</Text>}
                        <Text style={styles.description}>
                            {wallpaper.story || wallpaper.description || 'Premium architectural wall covering with hand-crafted textures.'}
                        </Text>
                    </View>

                    {wallpaper.customer_fit?.length > 0 && (
                        <View style={styles.storySection}>
                            <Text style={styles.sectionTitle}>WHY CUSTOMERS LOVE IT</Text>
                            <View style={styles.storyList}>
                                {wallpaper.customer_fit.map((item, i) => (
                                    <View key={i} style={styles.storyBullet}>
                                        <Text style={styles.bulletText}>•</Text>
                                        <Text style={styles.listItem}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {wallpaper.mood_tags?.length > 0 && (
                        <View style={styles.storySection}>
                            <Text style={styles.sectionTitle}>MOOD</Text>
                            <Text style={styles.moodTags}>
                                {wallpaper.mood_tags.join('  •  ').toUpperCase()}
                            </Text>
                        </View>
                    )}

                    {wallpaper.ideal_for?.length > 0 && (
                        <View style={styles.storySection}>
                            <Text style={styles.sectionTitle}>IDEAL FOR</Text>
                            <View style={styles.storyList}>
                                {wallpaper.ideal_for.map((item, i) => (
                                    <View key={i} style={styles.storyBullet}>
                                        <Text style={styles.bulletText}>•</Text>
                                        <Text style={styles.listItem}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {wallpaper.whatsapp_line && (
                        <TouchableOpacity
                            style={styles.decisionBox}
                            onPress={() => {
                                // Simple copy fallback if Clipboard isn't present
                                // In a real app we'd use @react-native-clipboard/clipboard
                                console.log('Copy to clipboard:', wallpaper.whatsapp_line);
                                // Alert.alert('Copied', '10-Second decision line copied to clipboard');
                            }}
                        >
                            <View style={styles.decisionHeader}>
                                <Text style={styles.decisionIcon}>🧠</Text>
                                <Text style={styles.decisionLabel}>10-SECOND DECISION LINE</Text>
                                <Text style={styles.copyLabel}>COPY</Text>
                            </View>
                            <Text style={styles.decisionText}>"{wallpaper.whatsapp_line}"</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.specTitleContainer}>
                        <Text style={styles.sectionTitle}>MATERIALS & SPECS</Text>
                    </View>
                    <View style={styles.specGrid}>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>ROLL SIZE</Text>
                            <Text style={styles.specValue}>{wallpaper.roll_size || '0.53m x 10m'}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Text style={styles.specLabel}>PATTERN MATCH</Text>
                            <Text style={styles.specValue}>{wallpaper.pattern_match || 'Straight'}</Text>
                        </View>
                    </View>

                    <AIRecommendation currentWallpaperId={wallpaper.id} title="AI RECOMMENDED" />
                </View>
            </ScrollView>

            <EnquiryModal
                visible={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                wallpaper={wallpaper}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    galleryContainer: {
        height: 600,
        position: 'relative',
    },
    galleryImage: {
        width: width,
        height: 600,
        resizeMode: 'cover',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
        width: '100%',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 20,
    },
    topIcons: {
        position: 'absolute',
        top: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    topRightIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    name: {
        fontSize: 20,
        fontWeight: '300',
        letterSpacing: 2,
        marginBottom: 4,
    },
    code: {
        fontSize: 11,
        color: '#666',
        letterSpacing: 1,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
    },
    actions: {
        marginBottom: 40,
    },
    visualizerBtn: {
        backgroundColor: '#000',
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    visualizerBtnText: {
        color: '#fff',
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    enquiryBtn: {
        marginTop: 10,
        height: 54,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    enquiryBtnText: {
        color: '#000',
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: '900',
    },
    infoSection: {
        marginBottom: 30,
    },
    tagline: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#000',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 12,
        color: '#000',
    },
    description: {
        fontSize: 13,
        lineHeight: 22,
        color: '#333',
        fontWeight: '400',
    },
    storySection: {
        marginTop: 40,
        marginBottom: 20,
    },
    storyList: {
        marginTop: 5,
    },
    storyBullet: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    bulletText: {
        fontSize: 14,
        marginRight: 10,
        color: '#000',
    },
    listItem: {
        fontSize: 13,
        lineHeight: 20,
        color: '#444',
        flex: 1,
    },
    moodTags: {
        fontSize: 11,
        color: '#666',
        letterSpacing: 1.5,
        lineHeight: 18,
    },
    decisionBox: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginTop: 30,
        marginBottom: 40,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#eee',
    },
    decisionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    decisionIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    decisionLabel: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#000',
        flex: 1,
    },
    copyLabel: {
        fontSize: 8,
        color: '#999',
        fontWeight: 'bold',
    },
    decisionText: {
        fontSize: 13,
        fontStyle: 'italic',
        color: '#333',
        lineHeight: 20,
    },
    specTitleContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 30,
        marginBottom: 20,
    },
    specGrid: {
        flexDirection: 'row',
        marginBottom: 40,
    },
    specItem: {
        flex: 1,
    },
    specLabel: {
        fontSize: 9,
        color: '#999',
        letterSpacing: 1,
        marginBottom: 4,
    },
    specValue: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default WallpaperDetailScreen;
