import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, SafeAreaView, Dimensions, Modal, TextInput, ScrollView, Animated as RNAnimated } from 'react-native';
import { Sparkle, ImageOff, ChevronRight, Search, SlidersHorizontal, X, Check, ZoomIn } from 'lucide-react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { visualizerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ZoomModal = ({ visible, imageUrl, onClose }) => {
    const scale = useSharedValue(1);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = e.scale;
            focalX.value = e.focalX;
            focalY.value = e.focalY;
        })
        .onEnd(() => {
            scale.value = withSpring(1);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: focalX.value },
                { translateY: focalY.value },
                { scale: scale.value },
                { translateX: -focalX.value },
                { translateY: -focalY.value },
            ],
        };
    });

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.modalBg}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X color="#fff" size={30} />
                </TouchableOpacity>

                <GestureDetector gesture={pinchGesture}>
                    <Animated.View style={styles.zoomContainer}>
                        <Animated.Image
                            source={{ uri: imageUrl }}
                            style={[styles.fullImage, animatedStyle]}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </GestureDetector>

                <View style={styles.zoomHint}>
                    <Text style={styles.zoomHintText}>PINCH TO ZOOM</Text>
                </View>
            </View>
        </Modal>
    );
};

const VisualizationHistoryScreen = ({ navigation }) => {
    const { user, token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const [historyResp, groupsResp] = await Promise.all([
                visualizerApi.getHistory(token),
                // We might need to import categoryApi if not available, or just fetch groups from history itself
                // For now let's assume we can get unique group names from history or inject them
                visualizerApi.getHistory(token) // Dummy for now, will refine
            ]);
            setHistory(historyResp.data);

            // Extract unique groups from history for filtering if backend doesn't provide them easily
            const uniqueGroups = [...new Set(historyResp.data.map(item => item.wallpaper?.group_name).filter(Boolean))];
            setGroups(uniqueGroups.map((name, index) => ({ id: index, name })));
        } catch (error) {
            console.error('Fetch visualizer history error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>

            <View style={styles.imageGrid}>
                <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => setSelectedImageUrl(item.room_image_url)}
                >
                    <Text style={styles.imageLabel}>BEFORE</Text>
                    <Image
                        source={{ uri: item.room_image_url }}
                        style={styles.previewImage}
                    />
                    <View style={styles.zoomIndicator}>
                        <ZoomIn size={12} color="#fff" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => setSelectedImageUrl(item.generated_image_url)}
                >
                    <Text style={styles.imageLabel}>AFTER</Text>
                    <Image
                        source={{ uri: item.generated_image_url }}
                        style={styles.previewImage}
                    />
                    <View style={styles.zoomIndicator}>
                        <ZoomIn size={12} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>

            {item.wallpaper && (
                <TouchableOpacity
                    style={styles.wallpaperInfo}
                    onPress={() => navigation.navigate('WallpaperDetail', { slug: item.wallpaper.slug })}
                >
                    <View style={styles.wallpaperRow}>
                        <Text style={styles.wallpaperName}>{item.wallpaper.name?.toUpperCase()}</Text>
                        <ChevronRight size={16} color="#000" />
                    </View>
                    <Text style={styles.designCode}>{item.wallpaper.design_code}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <ZoomModal
                    visible={!!selectedImageUrl}
                    imageUrl={selectedImageUrl}
                    onClose={() => setSelectedImageUrl(null)}
                />
                <View style={styles.headerRow}>
                    <View style={styles.searchContainer}>
                        <Search color="#999" size={16} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="SEARCH BY DESIGN OR CODE"
                            placeholderTextColor="#999"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setIsFilterVisible(true)}
                    >
                        <SlidersHorizontal size={20} color={selectedGroupIds.length > 0 ? "#000" : "#666"} />
                        {selectedGroupIds.length > 0 && <View style={styles.filterDot} />}
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={isFilterVisible}
                    animationType="slide"
                    transparent={false}
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>FILTERS</Text>
                            <TouchableOpacity onPress={() => setSelectedGroupIds([])}>
                                <Text style={styles.resetText}>RESET</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>COLLECTIONS</Text>
                                <View style={styles.filterGrid}>
                                    {groups.map(group => (
                                        <TouchableOpacity
                                            key={group.id}
                                            style={[
                                                styles.filterChip,
                                                selectedGroupIds.includes(group.name) && styles.filterChipActive
                                            ]}
                                            onPress={() => {
                                                if (selectedGroupIds.includes(group.name)) {
                                                    setSelectedGroupIds(selectedGroupIds.filter(name => name !== group.name));
                                                } else {
                                                    setSelectedGroupIds([...selectedGroupIds, group.name]);
                                                }
                                            }}
                                        >
                                            <Text style={[
                                                styles.filterChipText,
                                                selectedGroupIds.includes(group.name) && styles.filterChipTextActive
                                            ]}>{group.name?.toUpperCase()}</Text>
                                            {selectedGroupIds.includes(group.name) && <Check size={12} color="#fff" style={{ marginLeft: 5 }} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={() => setIsFilterVisible(false)}
                        >
                            <Text style={styles.applyBtnText}>VIEW RESULTS</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </Modal>

                <FlatList
                    data={history.filter(item => {
                        const matchesSearch = !search ||
                            item.wallpaper?.name?.toLowerCase().includes(search.toLowerCase()) ||
                            item.wallpaper?.design_code?.toLowerCase().includes(search.toLowerCase());
                        const matchesGroup = selectedGroupIds.length === 0 ||
                            selectedGroupIds.includes(item.wallpaper?.group_name);
                        return matchesSearch && matchesGroup;
                    })}
                    renderItem={renderHistoryItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={history.length > 0 ? styles.listContent : styles.emptyContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListHeaderComponent={history.length > 0 ? (
                        <Text style={styles.listHeader}>VISUALIZATION HISTORY</Text>
                    ) : null}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Sparkle size={48} color="#eee" strokeWidth={1} />
                            <Text style={styles.emptyTitle}>NO HISTORY YET</Text>
                            <Text style={styles.emptySubtitle}>Your AI generated room visualizations will appear here.</Text>
                            <TouchableOpacity
                                style={styles.browseBtn}
                                onPress={() => navigation.navigate('Visualizer')}
                            >
                                <Text style={styles.browseBtnText}>TRY VISUALIZER</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </SafeAreaView>
        </GestureHandlerRootView>
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        gap: 10,
    },
    searchIcon: {
        marginLeft: 5,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 15,
        fontSize: 11,
        letterSpacing: 1,
        color: '#000',
        fontWeight: '500',
    },
    filterBtn: {
        marginLeft: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
        borderWidth: 2,
        borderColor: '#fff',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
    resetText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#999',
        letterSpacing: 1,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    filterSection: {
        marginBottom: 35,
    },
    filterLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 20,
        color: '#000',
    },
    filterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 2,
    },
    filterChipActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    filterChipText: {
        fontSize: 10,
        letterSpacing: 1,
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    applyBtn: {
        backgroundColor: '#000',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    listContent: {
        padding: 20,
    },
    zoomIndicator: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBg: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    zoomContainer: {
        width: width,
        height: width * 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    zoomHint: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    zoomHintText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    emptyContent: {
        flexGrow: 1,
    },
    listHeader: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 25,
        color: '#000',
    },
    historyCard: {
        marginBottom: 40,
        backgroundColor: '#fff',
    },
    cardHeader: {
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        marginBottom: 20,
    },
    dateText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#999',
        letterSpacing: 0.5,
    },
    imageGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    imageWrapper: {
        flex: 1,
    },
    imageLabel: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
        color: '#999',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 2,
        backgroundColor: '#f5f5f5',
    },
    wallpaperInfo: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
    },
    wallpaperRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    wallpaperName: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#000',
    },
    designCode: {
        fontSize: 10,
        color: '#666',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 30,
    },
    browseBtn: {
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 25,
        paddingVertical: 12,
    },
    browseBtnText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});

export default VisualizationHistoryScreen;
