import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return _jsx("div", { className: "flex items-center justify-center h-screen text-sm text-muted-foreground", children: "Checking session..." });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: redirectTo, replace: true });
    }
    return children;
};
export default ProtectedRoute;
