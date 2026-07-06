import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, FileText, BookOpen, LayoutDashboard, MessageSquare, Trophy, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();
    const handleSignIn = () => {
        navigate('/login');
    };
    const handleGetStarted = () => {
        navigate('/signup');
    };
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const navigationItems = [
        { name: 'STUDY HUB', icon: BookOpen, path: '/syllabus' },
        { name: 'ASK AI', icon: MessageSquare, path: '/ask-ai' },
        { name: 'DASHBOARD', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'QUIZ', icon: Trophy, path: '/quiz' },
        { name: 'NOTES', icon: FileText, path: '/notes' },
    ];
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-gray-800/50 z-50", children: _jsxs("div", { className: "container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3", children: [_jsxs("div", { className: "flex items-center justify-between relative", children: [_jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsx("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-lg", children: _jsx(Brain, { className: "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-sm xs:text-base sm:text-lg md:text-xl font-bold text-white", children: "LastMin AI" }), _jsx("p", { className: "text-xs text-gray-400 hidden xs:block sm:block", children: "Smart Study Companion" })] })] }), isAuthenticated && (_jsx("nav", { className: "hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2", children: _jsx("div", { className: "flex items-center gap-4", children: navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (_jsxs("button", { onClick: () => navigate(item.path), className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), item.name] }, item.name));
                                }) }) })), isAuthenticated && (_jsx("nav", { className: "hidden md:flex lg:hidden items-center justify-center absolute left-1/2 transform -translate-x-1/2", children: _jsx("div", { className: "flex items-center gap-3", children: navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (_jsx("button", { onClick: () => navigate(item.path), className: `flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`, title: item.name, children: _jsx(Icon, { className: "h-4 w-4" }) }, item.name));
                                }) }) })), _jsx("div", { className: "hidden lg:flex items-center gap-3", children: isAuthenticated ? (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-purple-600/60", children: _jsx(User, { className: "h-4 w-4 text-white" }) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleLogout, className: "border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { className: "hidden xl:inline", children: "LOG OUT" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "hero", size: "sm", onClick: handleGetStarted, className: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium", children: "Get Started" }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleSignIn, className: "border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm px-6 py-2 rounded-lg text-sm font-medium", children: "Sign In" })] })) }), _jsx("div", { className: "hidden md:flex lg:hidden items-center gap-3", children: isAuthenticated ? (_jsx(Button, { variant: "outline", size: "sm", onClick: handleLogout, className: "border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center justify-center p-2.5 rounded-lg transition-all duration-200", title: "Log Out", children: _jsx(LogOut, { className: "h-4 w-4" }) })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "hero", size: "sm", onClick: handleGetStarted, className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium", children: "Get Started" }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleSignIn, className: "border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium", children: "Sign In" })] })) }), !isAuthenticated ? (_jsxs("div", { className: "flex md:hidden items-center gap-2", children: [_jsx(Button, { variant: "hero", size: "sm", onClick: handleGetStarted, className: "bg-purple-600 hover:bg-purple-700 text-white px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-medium min-h-[36px] xs:min-h-[40px]", children: "Get Started" }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleSignIn, className: "border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-medium min-h-[36px] xs:min-h-[40px]", children: "Sign In" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden sm:flex md:hidden items-center", children: _jsx(Button, { variant: "outline", size: "sm", onClick: handleLogout, className: "border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center justify-center p-2 rounded-lg transition-all duration-200", title: "Log Out", children: _jsx(LogOut, { className: "h-4 w-4" }) }) }), _jsx("button", { className: "md:hidden p-1.5 sm:p-2 text-gray-200 hover:text-white transition-colors duration-200", onClick: () => setIsMenuOpen(!isMenuOpen), children: isMenuOpen ? _jsx(X, { className: "h-5 w-5 sm:h-6 sm:w-6" }) : _jsx(Menu, { className: "h-5 w-5 sm:h-6 sm:w-6" }) })] }))] }), isMenuOpen && (_jsx(motion.div, { className: "md:hidden mt-3 sm:mt-4 py-3 sm:py-4 border-t border-gray-800/50", initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.2, ease: 'easeOut' }, children: _jsx("nav", { className: "flex flex-col gap-2 sm:gap-3", children: isAuthenticated ? (_jsxs(_Fragment, { children: [navigationItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (_jsxs(motion.button, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.2, delay: index * 0.1 }, onClick: () => {
                                            navigate(item.path);
                                            setIsMenuOpen(false);
                                        }, className: `flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 min-h-[44px] touch-manipulation ${isActive
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50'}`, children: [_jsx(Icon, { className: "h-4 w-4 sm:h-5 sm:w-5" }), item.name] }, item.name));
                                }), _jsxs("div", { className: "border-t border-gray-800/50 pt-3 sm:pt-4 mt-3 sm:mt-4", children: [_jsxs("div", { className: "flex items-center gap-3 px-3 sm:px-4 mb-2 sm:mb-3", children: [_jsx("div", { className: "flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-purple-600/60", children: _jsx(User, { className: "h-4 w-4 text-white" }) }), _jsx("span", { className: "text-gray-300 text-sm font-medium", children: user?.name || 'User' })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }, className: "w-full border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center gap-2 justify-center py-2.5 sm:py-3 rounded-lg transition-all duration-200", children: [_jsx(LogOut, { className: "h-4 w-4" }), "LOG OUT"] })] })] })) : (_jsxs("div", { className: "flex flex-col gap-2 sm:gap-3", children: [_jsx(Button, { variant: "hero", size: "sm", onClick: () => {
                                        handleGetStarted();
                                        setIsMenuOpen(false);
                                    }, className: "bg-purple-600 hover:bg-purple-700 text-white py-2.5 sm:py-3 rounded-lg font-medium", children: "Get Started" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                        handleSignIn();
                                        setIsMenuOpen(false);
                                    }, className: "border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm py-2.5 sm:py-3 rounded-lg font-medium", children: "Sign In" })] })) }) }))] }) }));
};
export default Header;
