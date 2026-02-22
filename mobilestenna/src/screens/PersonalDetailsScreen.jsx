import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { ChevronLeft, User, Mail, Shield, Calendar } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const PersonalDetailsScreen = ({ navigation }) => {
    const { user } = useAuth();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>PERSONAL DETAILS</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Mail size={18} color="#000" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.label}>EMAIL ADDRESS</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Shield size={18} color="#000" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.label}>ACCOUNT TYPE</Text>
                            <Text style={styles.value}>{user?.role?.toUpperCase() || 'CUSTOMER'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Calendar size={18} color="#000" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.label}>JOINED SINCE</Text>
                            <Text style={styles.value}>{formatDate(user?.created_at)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <User size={18} color="#000" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.label}>USER ID</Text>
                            <Text style={styles.value} numberOfLines={1}>{user?.id}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                        To update your email or password, please contact our support team at support@stenna.in
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 3,
    },
    backBtn: {
        padding: 10,
        marginLeft: -10,
    },
    content: {
        flex: 1,
        padding: 25,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#999',
        marginBottom: 30,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 20,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
    },
    label: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    noteBox: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
    },
    noteText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
        letterSpacing: 0.5,
    },
});

export default PersonalDetailsScreen;
