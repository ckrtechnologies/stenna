import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Dimensions, Modal } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Upload, Sparkles, History, Camera, Image as ImageIcon, X, ZoomIn } from 'lucide-react-native';
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
                        <Animated.Image source={{ uri: imageUrl }} style={[styles.fullImage, animatedStyle]} resizeMode="contain" />
                    </Animated.View>
                </GestureDetector>
                <View style={styles.zoomHint}>
                    <Text style={styles.zoomHintText}>PINCH TO ZOOM</Text>
                </View>
            </View>
        </Modal>
    );
};

const VisualizerScreen = ({ route, navigation }) => {
    const { wallpaperId } = route.params || {};
    const { token, user } = useAuth();

    const [roomImage, setRoomImage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    useEffect(() => {
        if (user && token) {
            fetchHistory();
        }
    }, [user, token]);

    const fetchHistory = async () => {
        try {
            const resp = await visualizerApi.getHistory(token);
            setHistory(resp.data);
        } catch (e) {
            console.error('History fetch failed', e);
        }
    };

    const handleSelectImage = async (useCamera = false) => {
        const options = { mediaType: 'photo', quality: 0.8 };
        const result = useCamera ? await launchCamera(options) : await launchImageLibrary(options);

        if (result.assets && result.assets.length > 0) {
            setRoomImage(result.assets[0]);
            setResultImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!roomImage || !wallpaperId) {
            Alert.alert('Error', 'Please select a room image and ensure a wallpaper is selected.');
            return;
        }

        if (!token) {
            Alert.alert('Authentication Required', 'Please log in to use the AI Visualizer.');
            return;
        }

        setIsGenerating(true);
        try {
            console.log('Starting visualization for wallpaperId:', wallpaperId);
            // 1. Prepare FormData for room upload
            const formData = new FormData();
            formData.append('roomImage', {
                uri: roomImage.uri,
                type: roomImage.type || 'image/jpeg',
                name: roomImage.fileName || 'room.jpg',
            });

            console.log('Uploading room image...');
            // 2. Upload room image
            const uploadResp = await visualizerApi.uploadRoom(token, formData);
            const roomUrl = uploadResp.data.url;
            console.log('Room image uploaded:', roomUrl);

            console.log('Requesting AI generation...');
            // 3. Generate visualization
            const genResp = await visualizerApi.generate(token, {
                wallpaperId,
                roomImageUrl: roomUrl
            });

            console.log('AI generation complete:', genResp.data.generatedUrl);
            setResultImage(genResp.data.generatedUrl);
            fetchHistory(); // Refresh history
            Alert.alert('Success', 'Visualization generated successfully!');
        } catch (error) {
            console.error('Visualization error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            Alert.alert(
                'Generation Failed',
                error.response?.data?.message || 'Something went wrong with the AI transformation. Please try again later.'
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const renderHistory = () => (
        <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>VISUALIZATION HISTORY</Text>
            {history.length === 0 ? (
                <Text style={styles.emptyText}>No history yet.</Text>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {history.map((item) => (
                        <View key={item.id} style={styles.historyItem}>
                            <Image source={{ uri: item.generated_image_url }} style={styles.historyThumb} />
                            <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
            <TouchableOpacity style={styles.closeHistory} onPress={() => setShowHistory(false)}>
                <Text style={styles.closeHistoryText}>CLOSE</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <ZoomModal
                    visible={!!selectedImageUrl}
                    imageUrl={selectedImageUrl}
                    onClose={() => setSelectedImageUrl(null)}
                />
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <Text style={styles.title}>AI VISUALIZER</Text>
                        {user && (
                            <TouchableOpacity onPress={() => navigation.navigate('VisualizationHistory')}>
                                <History color="#000" size={24} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.previewFrame}>
                        {isGenerating ? (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator color="#000" size="large" />
                                <Text style={styles.loadingText}>TRANSFORMING YOUR SPACE...</Text>
                                <Text style={styles.loadingSubtext}>Our AI is applying the wallpaper to your walls.</Text>
                            </View>
                        ) : resultImage ? (
                            <TouchableOpacity style={styles.previewContainer} onPress={() => setSelectedImageUrl(resultImage)}>
                                <Image source={{ uri: resultImage }} style={styles.preview} />
                                <View style={styles.zoomIndicator}>
                                    <ZoomIn size={16} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        ) : roomImage ? (
                            <Image source={{ uri: roomImage.uri }} style={styles.preview} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Upload color="#ccc" size={48} />
                                <Text style={styles.placeholderText}>UPLOAD A PHOTO OF YOUR ROOM</Text>
                                <Text style={styles.placeholderHint}>For best results, use a well-lit photo of an empty wall.</Text>
                            </View>
                        )}
                    </View>

                    {!wallpaperId && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>NO WALLPAPER SELECTED</Text>
                            <TouchableOpacity
                                style={styles.selectBtn}
                                onPress={() => navigation.navigate('CatalogTab')}
                            >
                                <Text style={styles.selectBtnText}>GO TO CATALOG</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!resultImage && (
                        <View style={styles.selectionActions}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleSelectImage(true)}>
                                <Camera color="#000" size={20} />
                                <Text style={styles.actionText}>TAKE PHOTO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleSelectImage(false)}>
                                <ImageIcon color="#000" size={20} />
                                <Text style={styles.actionText}>CHOOSE FROM LIBRARY</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {roomImage && !resultImage && (
                        <TouchableOpacity
                            style={styles.generateBtn}
                            onPress={handleGenerate}
                            disabled={isGenerating}
                        >
                            <Sparkles color="#fff" size={20} />
                            <Text style={styles.generateBtnText}>GENERATE VISUALIZATION</Text>
                        </TouchableOpacity>
                    )}

                    {resultImage && (
                        <View style={styles.resultActions}>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => { setResultImage(null); setRoomImage(null); }}>
                                <Text style={styles.resetBtnText}>NEW VISUALIZATION</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn}>
                                <Text style={styles.saveBtnText}>SAVE TO GALLERY</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {history.length > 0 && (
                        <View style={styles.recentSection}>
                            <View style={styles.recentHeader}>
                                <Text style={styles.recentTitle}>RECENT VISUALIZATIONS</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('VisualizationHistory')}>
                                    <Text style={styles.seeAllText}>SEE ALL</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
                                {history.slice(0, 5).map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.recentItem}
                                        onPress={() => setSelectedImageUrl(item.generated_image_url)}
                                    >
                                        <Image source={{ uri: item.generated_image_url }} style={styles.recentThumb} />
                                        <View style={styles.recentZoomIndicator}>
                                            <ZoomIn size={10} color="#fff" />
                                        </View>
                                        <Text style={styles.recentDate}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </ScrollView>

                {showHistory && renderHistory()}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: '300',
        letterSpacing: 4,
    },
    previewFrame: {
        width: width,
        height: width * 1.2,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    preview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        alignItems: 'center',
        padding: 40,
    },
    placeholderText: {
        fontSize: 12,
        letterSpacing: 2,
        marginTop: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    placeholderHint: {
        fontSize: 10,
        color: '#999',
        marginTop: 10,
        textAlign: 'center',
    },
    loadingOverlay: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 14,
        letterSpacing: 2,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 11,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    selectionActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 15,
    },
    actionBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#eee',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        gap: 8,
    },
    actionText: {
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: '600',
    },
    generateBtn: {
        backgroundColor: '#000',
        margin: 20,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        borderRadius: 4,
    },
    generateBtnText: {
        color: '#fff',
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    resultActions: {
        paddingHorizontal: 20,
        gap: 15,
    },
    resetBtn: {
        borderWidth: 1,
        borderColor: '#000',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetBtnText: {
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: '#000',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    historyContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        height: 300,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        padding: 25,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 20,
    },
    historyItem: {
        marginRight: 15,
        alignItems: 'center',
    },
    historyThumb: {
        width: 120,
        height: 150,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    historyDate: {
        fontSize: 9,
        color: '#999',
        marginTop: 8,
        letterSpacing: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
        fontSize: 12,
    },
    closeHistory: {
        marginTop: 20,
        alignItems: 'center',
    },
    closeHistoryText: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
        textDecorationLine: 'underline',
    },
    warningBox: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff1f1',
        borderWidth: 1,
        borderColor: '#ffc1c1',
        alignItems: 'center',
    },
    warningText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: '#d32f2f',
        marginBottom: 15,
    },
    recentSection: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    recentTitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#000',
    },
    seeAllText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#999',
        letterSpacing: 1,
    },
    recentList: {
        gap: 15,
    },
    recentItem: {
        width: 120,
    },
    recentThumb: {
        width: 120,
        height: 150,
        borderRadius: 2,
        backgroundColor: '#f5f5f5',
    },
    recentDate: {
        fontSize: 8,
        color: '#999',
        marginTop: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    selectBtn: {
        borderWidth: 1,
        borderColor: '#d32f2f',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    selectBtnText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#d32f2f',
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
    previewContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    zoomIndicator: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentZoomIndicator: {
        position: 'absolute',
        top: 120,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VisualizerScreen;
