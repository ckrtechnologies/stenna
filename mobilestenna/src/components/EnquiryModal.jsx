import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { X, CheckCircle2 } from 'lucide-react-native';
import { wallpaperApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EnquiryModal = ({ visible, onClose, wallpaper }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            setError('Please fill out all fields.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await wallpaperApi.submitEnquiry({
                ...formData,
                wallpaper_id: wallpaper.id,
                user_id: user?.id,
            });
            setSuccess(true);
        } catch (err) {
            console.error('Submit enquiry error:', err);
            setError(err.response?.data?.error || 'Failed to submit enquiry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>ENQUIRY</Text>
                    <View style={{ width: 40 }} />
                </View>

                {success ? (
                    <View style={styles.successContainer}>
                        <CheckCircle2 size={64} color="#000" strokeWidth={1} />
                        <Text style={styles.successTitle}>ENQUIRY SENT</Text>
                        <Text style={styles.successMessage}>
                            Thank you for your interest. Our team will get back to you with a personalized quote shortly.
                        </Text>
                        <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                            <Text style={styles.doneBtnText}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                        <Text style={styles.title}>ENQUIRE FOR QUOTE</Text>
                        <Text style={styles.subtitle}>
                            Interested in <Text style={{ fontWeight: '900' }}>{wallpaper?.name}</Text>? Fill out the form and we'll contact you.
                        </Text>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>FULL NAME</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChangeText={(val) => handleChange('name', val)}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>EMAIL ADDRESS</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChangeText={(val) => handleChange('email', val)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>PHONE NUMBER</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+91 ...."
                                    value={formData.phone}
                                    onChangeText={(val) => handleChange('phone', val)}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>CUSTOM REQUIREMENTS</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Tell us about your room size or specific needs..."
                                    value={formData.message}
                                    onChangeText={(val) => handleChange('message', val)}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <TouchableOpacity
                                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>SUBMIT ENQUIRY</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 3,
    },
    content: {
        flex: 1,
        padding: 30,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        marginBottom: 30,
        letterSpacing: 0.5,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 10,
        color: '#000',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 10,
        fontSize: 13,
        color: '#000',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        borderBottomWidth: 1,
    },
    submitBtn: {
        backgroundColor: '#000',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 11,
        marginBottom: 20,
        textAlign: 'center',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    successTitle: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 3,
        marginTop: 25,
        marginBottom: 15,
    },
    successMessage: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    doneBtn: {
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 40,
        paddingVertical: 15,
    },
    doneBtnText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    }
});

export default EnquiryModal;
