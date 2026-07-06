import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
const Dashboard = () => {
    const features = [
        {
            icon: BookOpen,
            title: "Study Hub",
            description: "Upload files, answer question banks, generate notes, and create practice questions",
            action: "Open Study Hub",
            color: "bg-blue-500/20 border-blue-500/30",
            link: "/syllabus"
        },
        {
            icon: MessageSquare,
            title: "AI Chat Tutor",
            description: "Get instant help and explanations from your AI tutor",
            action: "Start Chat",
            color: "bg-purple-500/20 border-purple-500/30",
            link: "/ask-ai"
        },
        {
            icon: FileText,
            title: "Practice Quiz",
            description: "Test your knowledge with AI-generated quizzes",
            action: "Take Quiz",
            color: "bg-green-500/20 border-green-500/30",
            link: "/quiz"
        },
        {
            icon: Target,
            title: "View Notes",
            description: "Access and manage your generated study notes",
            action: "View Notes",
            color: "bg-orange-500/20 border-orange-500/30",
            link: "/notes"
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-cosmic pt-16 sm:pt-20", children: [_jsx(Header, {}), _jsx("div", { className: "container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8 sm:mb-10 lg:mb-12", children: [_jsx("h1", { className: "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2", children: "Welcome to LastMin AI" }), _jsx("p", { className: "text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto px-4", children: "Your intelligent study companion is ready to help you learn faster and more effectively. Choose how you'd like to get started below." })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12", children: features.map((feature, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 * index }, children: _jsx(Link, { to: feature.link, children: _jsxs(Card, { className: `bg-card/80 backdrop-blur-sm border-border hover:shadow-glow active:shadow-glow-strong transition-all duration-300 cursor-pointer group ${feature.color} h-full flex flex-col touch-manipulation`, children: [_jsxs(CardHeader, { className: "space-y-3 sm:space-y-4 p-5 sm:p-6 flex-grow", children: [_jsxs("div", { className: "flex items-center gap-3 sm:gap-4", children: [_jsx("div", { className: "bg-gradient-primary p-2 sm:p-2.5 rounded-lg group-hover:scale-110 group-active:scale-105 transition-transform", children: _jsx(feature.icon, { className: "h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-foreground" }) }), _jsx(CardTitle, { className: "text-lg sm:text-xl lg:text-2xl text-foreground", children: feature.title })] }), _jsx(CardDescription, { className: "text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed", children: feature.description })] }), _jsx(CardContent, { className: "p-5 sm:p-6 pt-0 mt-auto", children: _jsx(Button, { className: "w-full bg-gradient-primary hover:opacity-90 active:opacity-80 shadow-soft text-sm sm:text-base lg:text-lg h-12 sm:h-14 touch-manipulation font-medium", children: feature.action }) })] }) }) }, index))) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.5 }, className: "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8", children: [_jsx(Card, { className: "bg-card/80 backdrop-blur-sm border-border text-center", children: _jsxs(CardContent, { className: "pt-4 sm:pt-6 p-4 sm:p-6", children: [_jsx("div", { className: "text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2", children: "0" }), _jsx("div", { className: "text-sm sm:text-base text-muted-foreground", children: "Documents Uploaded" })] }) }), _jsx(Card, { className: "bg-card/80 backdrop-blur-sm border-border text-center", children: _jsxs(CardContent, { className: "pt-4 sm:pt-6 p-4 sm:p-6", children: [_jsx("div", { className: "text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2", children: "0" }), _jsx("div", { className: "text-sm sm:text-base text-muted-foreground", children: "Study Sessions" })] }) }), _jsx(Card, { className: "bg-card/80 backdrop-blur-sm border-border text-center", children: _jsxs(CardContent, { className: "pt-4 sm:pt-6 p-4 sm:p-6", children: [_jsx("div", { className: "text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2", children: "0" }), _jsx("div", { className: "text-sm sm:text-base text-muted-foreground", children: "Quizzes Completed" })] }) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.6 }, children: _jsxs(Card, { className: "bg-card/80 backdrop-blur-sm border-border", children: [_jsx(CardHeader, { className: "p-4 sm:p-6", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-foreground text-lg sm:text-xl", children: [_jsx(BookOpen, { className: "h-4 w-4 sm:h-5 sm:w-5" }), "Recent Activity"] }) }), _jsx(CardContent, { className: "p-4 sm:p-6 pt-0", children: _jsxs("div", { className: "text-center py-6 sm:py-8 text-muted-foreground", children: [_jsx(BookOpen, { className: "h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" }), _jsx("p", { className: "text-sm sm:text-base", children: "No recent activity yet." }), _jsx("p", { className: "text-xs sm:text-sm mt-1 sm:mt-2", children: "Start by uploading your first study material!" })] }) })] }) })] }) })] }));
};
export default Dashboard;
