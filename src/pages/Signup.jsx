import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, User, Eye, EyeOff, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    // Validate password
    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        return errors;
    };
    // Validate form
    const validateForm = () => {
        const errors = [];
        if (!formData.name.trim()) {
            errors.push('Name is required');
        }
        else if (formData.name.length < 2 || formData.name.length > 50) {
            errors.push('Name must be between 2 and 50 characters');
        }
        if (!formData.email.trim()) {
            errors.push('Email is required');
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Please provide a valid email');
        }
        const passwordErrors = validatePassword(formData.password);
        errors.push(...passwordErrors);
        return errors;
    };
    const handleSignup = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setError('');
        setValidationErrors([]);
        // Validate form
        const errors = validateForm();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return false;
        }
        setIsLoading(true);
        try {
            const result = await register(formData);
            if (result.success) {
                navigate('/dashboard');
            }
            else {
                setError(result.error || 'Registration failed');
            }
        }
        catch (err) {
            setError('An unexpected error occurred');
        }
        finally {
            setIsLoading(false);
        }
        return false;
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear validation errors when user starts typing
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
        // Clear general error when user starts typing
        if (error) {
            setError('');
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSignup();
        }
    };
    return (_jsxs("div", { className: "h-screen bg-gradient-cosmic flex items-center justify-center p-2 overflow-hidden", children: [_jsx("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "w-full max-w-sm relative z-10", children: _jsxs(Card, { className: "bg-card/95 backdrop-blur-md border-2 border-white shadow-2xl shadow-primary/25", children: [_jsxs(CardHeader, { className: "text-center space-y-2 pb-4", children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "bg-gradient-primary p-2 rounded-full shadow-lg shadow-primary/40", children: _jsx(Brain, { className: "h-6 w-6 text-primary-foreground" }) }) }), _jsx(CardTitle, { className: "text-xl font-bold text-foreground", children: "Create Account" }), _jsx(CardDescription, { className: "text-sm text-muted-foreground", children: "Start your journey with LastMin AI" })] }), _jsxs(CardContent, { className: "space-y-4 px-6 pb-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "name", className: "text-sm text-foreground font-medium", children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "name", name: "name", type: "text", placeholder: "Enter your username", value: formData.name, onChange: handleInputChange, onKeyDown: handleKeyDown, className: "pl-10 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm", required: true })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "email", className: "text-sm text-foreground font-medium", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "Enter your email", value: formData.email, onChange: handleInputChange, onKeyDown: handleKeyDown, className: "pl-10 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm", required: true })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "password", className: "text-sm text-foreground font-medium", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", placeholder: "Create a password", value: formData.password, onChange: handleInputChange, onKeyDown: handleKeyDown, className: "pl-10 pr-12 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] }), formData.password && (_jsxs("div", { className: "text-xs mt-2 space-y-2", children: [_jsx("div", { className: "font-medium text-muted-foreground", children: "Password must contain:" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { className: `flex items-center gap-2 transition-all duration-200 ${formData.password.length >= 6 ? 'text-green-600' : 'text-muted-foreground'}`, children: [_jsx("div", { className: `flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${formData.password.length >= 6
                                                                                ? 'bg-green-500 border-green-500'
                                                                                : 'border-muted-foreground/30'}`, children: formData.password.length >= 6 ? (_jsx(Check, { className: "w-2.5 h-2.5 text-white" })) : (_jsx(X, { className: "w-2.5 h-2.5 text-muted-foreground/50" })) }), _jsx("span", { className: formData.password.length >= 6 ? 'font-medium' : '', children: "6+ characters" })] }), _jsxs("div", { className: `flex items-center gap-2 transition-all duration-200 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`, children: [_jsx("div", { className: `flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${/[a-z]/.test(formData.password)
                                                                                ? 'bg-green-500 border-green-500'
                                                                                : 'border-muted-foreground/30'}`, children: /[a-z]/.test(formData.password) ? (_jsx(Check, { className: "w-2.5 h-2.5 text-white" })) : (_jsx(X, { className: "w-2.5 h-2.5 text-muted-foreground/50" })) }), _jsx("span", { className: /[a-z]/.test(formData.password) ? 'font-medium' : '', children: "Lowercase" })] }), _jsxs("div", { className: `flex items-center gap-2 transition-all duration-200 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`, children: [_jsx("div", { className: `flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${/[A-Z]/.test(formData.password)
                                                                                ? 'bg-green-500 border-green-500'
                                                                                : 'border-muted-foreground/30'}`, children: /[A-Z]/.test(formData.password) ? (_jsx(Check, { className: "w-2.5 h-2.5 text-white" })) : (_jsx(X, { className: "w-2.5 h-2.5 text-muted-foreground/50" })) }), _jsx("span", { className: /[A-Z]/.test(formData.password) ? 'font-medium' : '', children: "Uppercase" })] }), _jsxs("div", { className: `flex items-center gap-2 transition-all duration-200 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`, children: [_jsx("div", { className: `flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${/\d/.test(formData.password)
                                                                                ? 'bg-green-500 border-green-500'
                                                                                : 'border-muted-foreground/30'}`, children: /\d/.test(formData.password) ? (_jsx(Check, { className: "w-2.5 h-2.5 text-white" })) : (_jsx(X, { className: "w-2.5 h-2.5 text-muted-foreground/50" })) }), _jsx("span", { className: /\d/.test(formData.password) ? 'font-medium' : '', children: "Number" })] })] })] }))] }), validationErrors.length > 0 && (_jsxs("div", { className: "p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg", children: [_jsx("p", { className: "text-yellow-600 text-sm font-medium mb-1", children: "Please fix the following:" }), _jsx("ul", { className: "text-yellow-600 text-sm space-y-1", children: validationErrors.map((error, index) => (_jsxs("li", { className: "flex items-start gap-1", children: [_jsx("span", { className: "text-yellow-500 mt-0.5", children: "\u2022" }), error] }, index))) })] })), error && (_jsx("div", { className: "p-3 bg-destructive/10 border border-destructive/20 rounded-lg", children: _jsx("p", { className: "text-destructive text-sm", children: error }) })), _jsx(Button, { type: "button", onClick: handleSignup, className: "w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg shadow-primary/30 h-10 rounded-lg font-semibold text-sm mt-4 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", disabled: isLoading || validationErrors.length > 0, children: isLoading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Creating account..."] })) : ("Create Account") })] }), _jsx("div", { className: "text-center mt-3", children: _jsx(Link, { to: "/", className: "text-xs text-muted-foreground hover:text-foreground transition-colors", children: "\u2190 Back to home" }) }), _jsx("div", { className: "text-center text-xs text-muted-foreground mt-3", children: "Already have an account?" }), _jsx("div", { className: "text-center mt-1", children: _jsx(Link, { to: "/login", children: _jsx(Button, { variant: "outline", size: "sm", className: "border-white/20 bg-card/60 hover:bg-card/80 backdrop-blur-sm text-xs h-8", children: "Sign in" }) }) })] })] }) })] }));
};
export default Signup;
