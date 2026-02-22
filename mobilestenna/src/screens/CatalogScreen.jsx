import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Modal, ScrollView, SafeAreaView } from 'react-native';
import { SlidersHorizontal, X, ChevronRight, Check, Sparkles } from 'lucide-react-native';
import { wallpaperApi, categoryApi } from '../services/api';
import React, { useState, useEffect } from 'react';


const CatalogScreen = ({ navigation, route }) => {
    const { groupId } = route.params || {};
    const [wallpapers, setWallpapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [imageErrors, setImageErrors] = useState({});

    // Filter State
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState(groupId ? [groupId] : []);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        fetchWallpapers();
    }, [selectedGroupIds, selectedCategoryIds]);

    const loadInitialData = async () => {
        try {
            const [groupsRes, catsRes] = await Promise.all([
                categoryApi.getGroups(),
                categoryApi.getAll()
            ]);
            setGroups(groupsRes.data);
            setAllCategories(catsRes.data);
            setCategories(catsRes.data);
        } catch (error) {
            console.error('Error loading filter data:', error);
        }
    };

    const fetchWallpapers = async () => {
        setLoading(true);
        try {
            const response = await wallpaperApi.getAll({
                activeOnly: 'true',
                groupIds: selectedGroupIds,
                categoryIds: selectedCategoryIds
            });
            setWallpapers(response.data);
        } catch (error) {
            console.error('Fetch wallpapers error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectGroup = (gId) => {
        let newGroupIds;
        if (selectedGroupIds.includes(gId)) {
            newGroupIds = selectedGroupIds.filter(id => id !== gId);
        } else {
            newGroupIds = [...selectedGroupIds, gId];
        }

        setSelectedGroupIds(newGroupIds);

        // Reset category selections when groups change to avoid invalid results
        setSelectedCategoryIds([]);

        if (newGroupIds.length > 0) {
            setCategories(allCategories.filter(c => newGroupIds.includes(c.group_id)));
        } else {
            setCategories(allCategories);
        }
    };

    const handleSelectCategory = (cId) => {
        if (selectedCategoryIds.includes(cId)) {
            setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cId));
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, cId]);
        }
    };

    const resetFilters = () => {
        setSelectedGroupIds([]);
        setSelectedCategoryIds([]);
        setCategories(allCategories);
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80';
        if (url.startsWith('http')) return url;
        return `https://jatwtohvdfvundhoigox.supabase.co/storage/v1/object/public/wallpapers/${url}`;
    };

    const renderItem = ({ item }) => {
        const mainImage = item.images && item.images.length > 0 ? item.images[0].image_url : null;

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('WallpaperDetail', { slug: item.slug })}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: imageErrors[item.id]
                                ? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80'
                                : getImageUrl(mainImage)
                        }}
                        style={styles.image}
                        onError={() => handleImageError(item.id)}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name?.toUpperCase()}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.code}>{item.design_code}</Text>
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
        );
    };

    const filteredWallpapers = wallpapers.filter(w =>
        w.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.design_code?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && wallpapers.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="SEARCH"
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => setIsFilterVisible(true)}
                >
                    <SlidersHorizontal size={20} color={selectedGroupIds.length > 0 || selectedCategoryIds.length > 0 ? "#000" : "#666"} />
                    {(selectedGroupIds.length > 0 || selectedCategoryIds.length > 0) && <View style={styles.filterDot} />}
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
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
                        <TouchableOpacity onPress={resetFilters}>
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
                                            selectedGroupIds.includes(group.id) && styles.filterChipActive
                                        ]}
                                        onPress={() => handleSelectGroup(group.id)}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedGroupIds.includes(group.id) && styles.filterChipTextActive
                                        ]}>{group.name?.toUpperCase()}</Text>
                                        {selectedGroupIds.includes(group.id) && <Check size={12} color="#fff" style={{ marginLeft: 5 }} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>CATEGORIES</Text>
                            <View style={styles.filterGrid}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.filterChip,
                                            selectedCategoryIds.includes(cat.id) && styles.filterChipActive
                                        ]}
                                        onPress={() => handleSelectCategory(cat.id)}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedCategoryIds.includes(cat.id) && styles.filterChipTextActive
                                        ]}>{cat.name?.toUpperCase()}</Text>
                                        {selectedCategoryIds.includes(cat.id) && <Check size={12} color="#fff" style={{ marginLeft: 5 }} />}
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
                data={filteredWallpapers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.list}
                onRefresh={fetchWallpapers}
                refreshing={loading}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchContainer: {
        flex: 1,
        paddingVertical: 15,
    },
    searchInput: {
        height: 40,
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 15,
        fontSize: 11,
        letterSpacing: 2,
        color: '#000',
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
    list: {
        padding: 5,
    },
    item: {
        flex: 1,
        margin: 5,
        width: '45%',
    },
    imageContainer: {
        height: 250,
        backgroundColor: '#f8f8f8',
        marginBottom: 8,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#eee',
    },
    info: {
        paddingHorizontal: 2,
    },
    name: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
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
        paddingHorizontal: 4,
        paddingVertical: 2,
        gap: 2,
    },
    tryOnMiniText: {
        fontSize: 6,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    code: {
        fontSize: 8,
        color: '#666',
        letterSpacing: 1,
    },
});

export default CatalogScreen;
