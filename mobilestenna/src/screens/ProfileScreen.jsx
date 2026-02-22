import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ChevronRight, FileText, Heart, History } from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        // signOut automatically handles state, and AppNavigator will switch to public stack
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.title}>MY ACCOUNT</Text>
                <Text style={styles.guestText}>Log in to access your profile, wishlist, and visualization history.</Text>
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
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user.email?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.email}>{user.email}</Text>
                    <Text style={styles.role}>{user.role?.toUpperCase() || 'CUSTOMER'}</Text>
                </View>

                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PersonalDetails')}
                    >
                        <View style={styles.menuItemLeft}>
                            <User size={20} color="#000" />
                            <Text style={styles.menuText}>PERSONAL DETAILS</Text>
                        </View>
                        <ChevronRight size={16} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('WishlistDrawer')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Heart size={20} color="#000" />
                            <Text style={styles.menuText}>WISHLIST</Text>
                        </View>
                        <ChevronRight size={16} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('VisualizationHistory')}
                    >
                        <View style={styles.menuItemLeft}>
                            <History size={20} color="#000" />
                            <Text style={styles.menuText}>MY VISUALIZATIONS</Text>
                        </View>
                        <ChevronRight size={16} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('MyEnquiries')}
                    >
                        <View style={styles.menuItemLeft}>
                            <FileText size={20} color="#000" />
                            <Text style={styles.menuText}>MY ENQUIRIES</Text>
                        </View>
                        <ChevronRight size={16} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                        <View style={styles.menuItemLeft}>
                            <LogOut size={20} color="#666" />
                            <Text style={[styles.menuText, { color: '#666' }]}>LOG OUT</Text>
                        </View>
                    </TouchableOpacity>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: '300',
        letterSpacing: 4,
        marginBottom: 20,
    },
    guestText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        lineHeight: 20,
        letterSpacing: 1,
        marginBottom: 40,
    },
    loginBtn: {
        backgroundColor: '#000',
        width: '100%',
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
    header: {
        alignItems: 'center',
        padding: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '300',
    },
    email: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    role: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
        letterSpacing: 2,
    },
    menu: {
        padding: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menuText: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    logoutItem: {
        marginTop: 20,
        borderBottomWidth: 0,
    },
});

export default ProfileScreen;
