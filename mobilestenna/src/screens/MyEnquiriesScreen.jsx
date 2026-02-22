import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { ChevronRight, MessageSquareOff } from 'lucide-react-native';
import { wallpaperApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyEnquiriesScreen = ({ navigation }) => {
    const { user, token } = useAuth();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        if (!user) return;
        try {
            const response = await wallpaperApi.getEnquiries(user.id, token);
            setEnquiries(response.data);
        } catch (error) {
            console.error('Fetch enquiries error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEnquiries();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderEnquiryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.enquiryCard}
            onPress={() => item.wallpaper && navigation.navigate('WallpaperDetail', { slug: item.wallpaper.slug })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'resolved' ? '#f0fdf4' : '#fff7ed' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'resolved' ? '#166534' : '#9a3412' }]}>
                        {(item.status || 'PENDING').toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                {item.wallpaper && (
                    <Image
                        source={{ uri: item.wallpaper.images?.[0]?.image_url }}
                        style={styles.wallpaperThumb}
                    />
                )}
                <View style={styles.enquiryInfo}>
                    <Text style={styles.wallpaperName}>{item.wallpaper?.name?.toUpperCase() || 'GENERAL ENQUIRY'}</Text>
                    <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
                </View>
                <ChevronRight size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={enquiries}
                renderItem={renderEnquiryItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={enquiries.length > 0 ? styles.listContent : styles.emptyContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={enquiries.length > 0 ? (
                    <Text style={styles.listHeader}>MY ENQUIRIES</Text>
                ) : null}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MessageSquareOff size={48} color="#eee" strokeWidth={1} />
                        <Text style={styles.emptyTitle}>NO ENQUIRIES YET</Text>
                        <Text style={styles.emptySubtitle}>Your wallpaper enquiries will appear here.</Text>
                        <TouchableOpacity
                            style={styles.browseBtn}
                            onPress={() => navigation.navigate('Catalog')}
                        >
                            <Text style={styles.browseBtnText}>EXPLORE CATALOG</Text>
                        </TouchableOpacity>
                    </View>
                }
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
    listContent: {
        padding: 20,
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
    enquiryCard: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingVertical: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 10,
        color: '#999',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 2,
    },
    statusText: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    wallpaperThumb: {
        width: 50,
        height: 50,
        borderRadius: 2,
        marginRight: 15,
        backgroundColor: '#f5f5f5',
    },
    enquiryInfo: {
        flex: 1,
    },
    wallpaperName: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 4,
        color: '#000',
    },
    messageText: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
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

export default MyEnquiriesScreen;
