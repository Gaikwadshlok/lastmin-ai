import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
const AuthContext = createContext(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    // Check if user is logged in on app start
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            if (savedToken && savedUser) {
                const userData = JSON.parse(savedUser);
                setIsAuthenticated(true);
                setUser(userData);
                setToken(savedToken);
            }
        }
        catch (error) {
            console.error('Error loading user data:', error);
            // Clear corrupted data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const login = async (credentials) => {
        try {
            setLoading(true);
            console.log('AuthContext: Attempting login');
            const response = await authService.login(credentials);
            console.log('AuthContext: Login response received', response.data);
            const { token: newToken, user: userData } = response.data.data;
            // Save to localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            // Update state
            setIsAuthenticated(true);
            setUser(userData);
            setToken(newToken);
            console.log('AuthContext: Login successful');
            return { success: true };
        }
        catch (error) {
            console.error('AuthContext: Login error:', error);
            console.error('AuthContext: Error response:', error.response?.data);
            let errorMessage = 'Login failed';
            // Handle specific error cases
            if (error.response?.status === 401) {
                const serverMessage = error.response?.data?.error?.message;
                if (serverMessage && serverMessage.toLowerCase().includes('invalid credentials')) {
                    errorMessage = 'Account not found or incorrect password. Please check your credentials or sign up.';
                }
                else {
                    errorMessage = serverMessage || 'Invalid email or password';
                }
            }
            else if (error.response?.status === 423) {
                errorMessage = 'Account is temporarily locked. Please try again later.';
            }
            else if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            }
            return {
                success: false,
                error: errorMessage
            };
        }
        finally {
            setLoading(false);
        }
    };
    const register = async (userData) => {
        try {
            setLoading(true);
            console.log('AuthContext: Attempting registration with:', {
                name: userData.name,
                email: userData.email,
                passwordLength: userData.password.length
            });
            const response = await authService.register(userData);
            console.log('AuthContext: Registration response received', response.data);
            const { token: newToken, user: newUser } = response.data.data;
            // Save to localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            // Update state
            setIsAuthenticated(true);
            setUser(newUser);
            setToken(newToken);
            console.log('AuthContext: Registration successful');
            return { success: true };
        }
        catch (error) {
            console.error('AuthContext: Registration error:', error);
            console.error('AuthContext: Error response:', error.response?.data);
            let errorMessage = 'Registration failed';
            // Handle validation errors
            if (error.response?.data?.error?.details) {
                const validationErrors = error.response.data.error.details;
                errorMessage = validationErrors.map((err) => err.msg).join(', ');
            }
            else if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            }
            return {
                success: false,
                error: errorMessage
            };
        }
        finally {
            setLoading(false);
        }
    };
    const updateProfile = async (data) => {
        try {
            const response = await authService.updateProfile(data);
            const updatedUser = response.data.data.user;
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Update state
            setUser(updatedUser);
            return { success: true };
        }
        catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Profile update failed'
            };
        }
    };
    const logout = () => {
        try {
            // Call logout API
            authService.logout().catch(console.error);
            // Clear state
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        catch (error) {
            console.error('Error during logout:', error);
        }
    };
    const value = {
        isAuthenticated,
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
