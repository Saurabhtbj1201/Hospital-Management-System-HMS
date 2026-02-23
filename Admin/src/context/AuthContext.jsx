import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState('');

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (err) {
                console.error('Failed to parse user data:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ identifier, password });

            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
                _id: response._id,
                name: response.name,
                email: response.email,
                phone: response.phone,
                role: response.role,
            }));

            setUser({
                _id: response._id,
                name: response.name,
                email: response.email,
                phone: response.phone,
                role: response.role,
            });

            return { success: true, role: response.role };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (updatedFields) => {
        const newUser = { ...user, ...updatedFields };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        profilePhoto,
        setProfilePhoto,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
