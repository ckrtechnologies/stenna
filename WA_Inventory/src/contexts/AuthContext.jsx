import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const savedUser = localStorage.getItem('wa_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setLoading(false);
        }

        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            localStorage.setItem('wa_user', JSON.stringify(res.data));
        } catch (error) {
            setUser(null);
            localStorage.removeItem('wa_user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.user);
        localStorage.setItem('wa_user', JSON.stringify(res.data.user));
        localStorage.setItem('token', JSON.stringify(res.data.user.token));
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            localStorage.removeItem('wa_user');
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
