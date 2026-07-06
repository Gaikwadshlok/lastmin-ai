import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    const handleLogin = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setError('');
        setIsLoading(true);
        try {
            const result = await login({ email, password });
            if (result.success) {
                navigate('/dashboard');
            }
            else {
                setError(result.error || 'Login failed');
            }
        }
        catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            // Trigger login without submitting a form
            void handleLogin();
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-cosmic flex items-center justify-center p-4 sm:p-6", children: [_jsx("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "w-full max-w-sm sm:max-w-md relative z-10", children: _jsxs(Card, { className: "bg-card/95 backdrop-blur-md border-2 border-white shadow-2xl shadow-primary/25", children: [_jsxs(CardHeader, { className: "text-center space-y-4 pb-6 sm:pb-8 px-6 sm:px-8 pt-6 sm:pt-8", children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "bg-gradient-primary p-3 sm:p-4 rounded-full shadow-lg shadow-primary/40", children: _jsx(Brain, { className: "h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" }) }) }), _jsx(CardTitle, { className: "text-xl sm:text-2xl font-bold text-foreground", children: "Welcome Back" }), _jsx(CardDescription, { className: "text-sm sm:text-base text-muted-foreground", children: "Sign in to your LastMin AI account" })] }), _jsxs(CardContent, { className: "space-y-5 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8", children: [_jsxs("div", { className: "space-y-5", onKeyDown: handleKeyDown, children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "text-foreground font-medium text-sm sm:text-base", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" }), _jsx(Input, { id: "email", type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), className: "pl-10 sm:pl-12 bg-input/60 border-border/60 h-12 sm:h-14 rounded-lg shadow-inner text-base touch-manipulation", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", className: "text-foreground font-medium text-sm sm:text-base", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" }), _jsx(Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), className: "pl-10 sm:pl-12 pr-12 sm:pr-14 bg-input/60 border-border/60 h-12 sm:h-14 rounded-lg shadow-inner text-base touch-manipulation", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4 sm:h-5 sm:w-5" })) : (_jsx(Eye, { className: "h-4 w-4 sm:h-5 sm:w-5" })) })] })] }), error && (_jsx("div", { className: "p-3 bg-destructive/10 border border-destructive/20 rounded-lg", children: _jsx("p", { className: "text-destructive text-sm", children: error }) })), _jsx(Button, { type: "button", onClick: handleLogin, className: "w-full bg-gradient-primary hover:opacity-90 active:opacity-80 shadow-lg shadow-primary/30 h-12 sm:h-14 rounded-lg font-semibold text-base touch-manipulation", disabled: isLoading, children: isLoading ? "Signing in..." : "Sign In" })] }), _jsx("div", { className: "text-center mt-4", children: _jsx(Link, { to: "/", className: "text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors touch-manipulation", children: "\u2190 Back to home" }) }), _jsx("div", { className: "text-center text-sm sm:text-base text-muted-foreground mt-6", children: "Don't have an account?" }), _jsx("div", { className: "text-center mt-3", children: _jsx(Link, { to: "/signup", children: _jsx(Button, { variant: "outline", size: "sm", className: "border-white/20 bg-card/60 hover:bg-card/80 active:bg-card/90 backdrop-blur-sm h-10 sm:h-12 px-6 touch-manipulation", children: "Sign up" }) }) })] })] }) })] }));
};
export default Login;
