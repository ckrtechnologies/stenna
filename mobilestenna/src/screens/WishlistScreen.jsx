import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const WishlistScreen = ({ navigation }) => {
    const { user } = useAuth();
    // Placeholder for wishlist items - in a real app, this would be fetched from API/Supabase
    const wishlistItems = [];

    if (!user) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.title}>WISHLIST</Text>
                <Text style={styles.message}>Please log in to view your wishlist.</Text>
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginBtnText}>LOG IN</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color="#000" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>WISHLIST</Text>
                <View style={{ width: 24 }} />
            </View> */}

            {wishlistItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>YOUR WISHLIST IS EMPTY</Text>
                    <TouchableOpacity
                        style={styles.shopBtn}
                        onPress={() => navigation.navigate('Catalog')}
                    >
                        <Text style={styles.shopBtnText}>DISCOVER WALLPAPERS</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => navigation.navigate('WallpaperDetail', { slug: item.slug })}
                        >
                            <Image source={{ uri: item.image_url }} style={styles.image} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name?.toUpperCase()}</Text>
                                <Text style={styles.itemCode}>{item.design_code}</Text>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.itemPrice}>₹ {item.price}</Text>
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
                            <TouchableOpacity style={styles.removeBtn}>
                                <Trash2 color="#999" size={18} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.list}
                />
            )}
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
        padding: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '300',
        letterSpacing: 4,
        marginBottom: 20,
    },
    message: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    loginBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 40,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 12,
        letterSpacing: 2,
        color: '#999',
        marginBottom: 30,
    },
    shopBtn: {
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    list: {
        padding: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
        paddingBottom: 25,
    },
    image: {
        width: 80,
        height: 100,
        backgroundColor: '#f8f8f8',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 20,
    },
    itemName: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    itemCode: {
        fontSize: 10,
        color: '#999',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    tryOnMiniBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 4,
    },
    tryOnMiniText: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    removeBtn: {
        padding: 10,
    },
});

export default WishlistScreen;
