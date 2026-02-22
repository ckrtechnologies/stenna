import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryApi } from '../services/api';
import AIRecommendation from '../components/AIRecommendation';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await categoryApi.getGroups();
            setGroups(response.data);
        } catch (error) {
            console.error('Fetch groups error:', error);
        } finally {
            setLoading(false);
        }
    };

    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const fallbackImages = [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e5252c35a93?auto=format&fit=crop&q=80'
    ];

    const getImageUrl = (url, index = 0) => {
        if (!url) return fallbackImages[index % fallbackImages.length];
        if (url.startsWith('http')) return url;
        return `https://jatwtohvdfvundhoigox.supabase.co/storage/v1/object/public/wallpapers/${url}`;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#000" />
                <Text style={styles.loadingText}>LOADING COLLECTIONS...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right','top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* <View style={styles.hero}>
                <Text style={styles.heroTitle}>STENNA</Text>
                <Text style={styles.heroSubtitle}>PURE MATERIALITY</Text>
                <TouchableOpacity
                    style={styles.heroButton}
                    onPress={() => navigation.navigate('CatalogTab')}
                >
                    <Text style={styles.heroButtonText}>ENTER ARCHIVE</Text>
                </TouchableOpacity>
            </View> */}

                {groups.map((group, index) => (
                    <View key={group.id} style={styles.section}>
                        <View style={styles.visualBlock}>
                            <Image
                                source={{
                                    uri: imageErrors[group.id]
                                        ? fallbackImages[index % fallbackImages.length]
                                        : getImageUrl(group.image_url, index)
                                }}
                                style={styles.sectionImage}
                                onError={() => handleImageError(group.id)}
                            />
                            <View style={styles.visualOverlay} />
                        </View>

                        <View style={styles.contentBlock}>
                            <Text style={styles.sectionLabel}>COLLECTION No. {index + 1} — {group.name?.toUpperCase()}</Text>
                            <Text style={styles.sectionTitle}>{group.name?.toUpperCase()}</Text>
                            <Text style={styles.description}>
                                {group.description || "Discover the essence of architectural purity with our hand-curated collection of premium wall coverings."}
                            </Text>
                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => navigation.navigate('CatalogTab', { groupId: group.id })}
                            >
                                <Text style={styles.linkButtonText}>EXPLORE {group.name?.toUpperCase()} COLLECTION</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <AIRecommendation title="TRENDING AI SELECTIONS" />
                <View style={{ height: 40 }} />
            </ScrollView>
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
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 10,
        letterSpacing: 2,
        color: '#000',
        fontWeight: '800',
    },
    hero: {
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    heroTitle: {
        fontSize: 40,
        fontWeight: '300',
        letterSpacing: 10,
    },
    heroSubtitle: {
        fontSize: 12,
        marginTop: 10,
        letterSpacing: 4,
        color: '#666',
        marginBottom: 40,
    },
    heroButton: {
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    heroButtonText: {
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 60,
    },
    visualBlock: {
        height: 600,
        width: width,
    },
    sectionImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#eee',
    },
    visualOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    contentBlock: {
        padding: 20,
        paddingTop: 30,
    },
    sectionLabel: {
        fontSize: 10,
        color: '#000',
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '300',
        letterSpacing: 3,
        marginBottom: 15,
    },
    description: {
        fontSize: 13,
        color: '#000',
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 25,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkButtonText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        textDecorationLine: 'underline',
    },
});

export default HomeScreen;
