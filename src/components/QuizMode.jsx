import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, CheckCircle, XCircle, ArrowRight, Target, Timer, Trophy } from "lucide-react";
const QuizMode = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [timeLeft] = useState(300); // 5 minutes
    const questions = [
        {
            id: '1',
            question: "What is the fundamental principle behind quantum superposition?",
            options: [
                "Particles can only exist in one state at a time",
                "Particles can exist in multiple states simultaneously until measured",
                "Particles always collapse to their ground state",
                "Particles cannot be observed directly"
            ],
            correctAnswer: 1,
            explanation: "Quantum superposition allows particles to exist in multiple states simultaneously until a measurement collapses the wave function.",
            difficulty: 'Medium'
        },
        {
            id: '2',
            question: "Which data structure uses LIFO (Last In, First Out) principle?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correctAnswer: 1,
            explanation: "A stack follows the LIFO principle where the last element added is the first one to be removed.",
            difficulty: 'Easy'
        }
    ];
    const handleStartQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestion(0);
        setScore(0);
        setShowAnswer(false);
        setSelectedAnswer(null);
    };
    const handleAnswerSelect = (answerIndex) => {
        if (showAnswer)
            return;
        setSelectedAnswer(answerIndex);
    };
    const handleSubmitAnswer = () => {
        if (selectedAnswer === null)
            return;
        setShowAnswer(true);
        if (selectedAnswer === questions[currentQuestion].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };
    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowAnswer(false);
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-accent/20 text-accent';
            case 'Medium': return 'bg-warning/20 text-warning';
            case 'Hard': return 'bg-destructive/20 text-destructive';
            default: return 'bg-muted text-muted-foreground';
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    if (!quizStarted) {
        return (_jsx("section", { className: "py-20 bg-gradient-secondary", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Quiz & Revision Mode" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Test your knowledge with AI-generated questions based on your syllabus" })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-6 mb-8", children: [_jsxs(Card, { className: "shadow-card border-0 hover:shadow-soft transition-all duration-300", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "bg-accent/20 p-4 rounded-xl w-fit mx-auto mb-4", children: _jsx(Target, { className: "h-8 w-8 text-accent" }) }), _jsx(CardTitle, { children: "Quick Quiz" }), _jsx(CardDescription, { children: "5 questions \u2022 5 minutes" })] }), _jsx(CardContent, { children: _jsxs(Button, { variant: "success", className: "w-full", onClick: handleStartQuiz, children: [_jsx(Play, { className: "h-4 w-4" }), "Start Now"] }) })] }), _jsxs(Card, { className: "shadow-card border-0 hover:shadow-soft transition-all duration-300", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "bg-warning/20 p-4 rounded-xl w-fit mx-auto mb-4", children: _jsx(Timer, { className: "h-8 w-8 text-warning" }) }), _jsx(CardTitle, { children: "Practice Mode" }), _jsx(CardDescription, { children: "15 questions \u2022 No time limit" })] }), _jsx(CardContent, { children: _jsxs(Button, { variant: "warning", className: "w-full", children: [_jsx(Play, { className: "h-4 w-4" }), "Practice"] }) })] }), _jsxs(Card, { className: "shadow-card border-0 hover:shadow-soft transition-all duration-300", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "bg-primary/20 p-4 rounded-xl w-fit mx-auto mb-4", children: _jsx(Trophy, { className: "h-8 w-8 text-primary" }) }), _jsx(CardTitle, { children: "Challenge Mode" }), _jsx(CardDescription, { children: "30 questions \u2022 20 minutes" })] }), _jsx(CardContent, { children: _jsxs(Button, { variant: "hero", className: "w-full", children: [_jsx(Play, { className: "h-4 w-4" }), "Challenge"] }) })] })] }), _jsxs(Card, { className: "shadow-card border-0", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(RotateCcw, { className: "h-5 w-5 text-primary" }), "Flashcard Review"] }), _jsx(CardDescription, { children: "Review key concepts with interactive flashcards" })] }), _jsx(CardContent, { children: _jsx(Button, { variant: "study", size: "lg", children: "Start Flashcards" }) })] })] }) }) }));
    }
    return (_jsx("section", { className: "py-20 bg-gradient-secondary", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-2xl font-bold text-foreground", children: "Quick Quiz" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Badge, { variant: "outline", className: "text-sm", children: [_jsx(Timer, { className: "h-3 w-3 mr-1" }), formatTime(timeLeft)] }), _jsxs(Badge, { variant: "secondary", className: "text-sm", children: ["Question ", currentQuestion + 1, " of ", questions.length] })] })] }), _jsx(Progress, { value: ((currentQuestion + 1) / questions.length) * 100, className: "h-2" })] }), _jsxs(Card, { className: "shadow-card border-0 mb-6", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx(Badge, { className: getDifficultyColor(questions[currentQuestion].difficulty), children: questions[currentQuestion].difficulty }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Score" }), _jsxs("p", { className: "text-xl font-bold text-foreground", children: [score, "/", questions.length] })] })] }), _jsx(CardTitle, { className: "text-xl leading-relaxed", children: questions[currentQuestion].question })] }), _jsx(CardContent, { className: "space-y-3", children: questions[currentQuestion].options.map((option, index) => (_jsx("button", { onClick: () => handleAnswerSelect(index), disabled: showAnswer, className: `w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${selectedAnswer === index
                                        ? showAnswer
                                            ? index === questions[currentQuestion].correctAnswer
                                                ? 'border-accent bg-accent/10 text-accent'
                                                : 'border-destructive bg-destructive/10 text-destructive'
                                            : 'border-primary bg-primary/10'
                                        : showAnswer && index === questions[currentQuestion].correctAnswer
                                            ? 'border-accent bg-accent/10 text-accent'
                                            : 'border-border hover:border-primary/50 hover:bg-muted/50'}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${selectedAnswer === index
                                                    ? showAnswer
                                                        ? index === questions[currentQuestion].correctAnswer
                                                            ? 'border-accent bg-accent text-accent-foreground'
                                                            : 'border-destructive bg-destructive text-destructive-foreground'
                                                        : 'border-primary bg-primary text-primary-foreground'
                                                    : showAnswer && index === questions[currentQuestion].correctAnswer
                                                        ? 'border-accent bg-accent text-accent-foreground'
                                                        : 'border-muted-foreground'}`, children: String.fromCharCode(65 + index) }), _jsx("span", { children: option }), showAnswer && index === questions[currentQuestion].correctAnswer && (_jsx(CheckCircle, { className: "h-5 w-5 text-accent ml-auto" })), showAnswer && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (_jsx(XCircle, { className: "h-5 w-5 text-destructive ml-auto" }))] }) }, index))) })] }), showAnswer && (_jsxs(Card, { className: "shadow-card border-0 mb-6", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx("div", { className: "bg-primary/20 p-2 rounded", children: _jsx(CheckCircle, { className: "h-4 w-4 text-primary" }) }), "Explanation"] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-muted-foreground leading-relaxed", children: questions[currentQuestion].explanation }) })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => setQuizStarted(false), children: "Exit Quiz" }), _jsx("div", { className: "flex gap-3", children: !showAnswer ? (_jsx(Button, { variant: "hero", onClick: handleSubmitAnswer, disabled: selectedAnswer === null, children: "Submit Answer" })) : currentQuestion < questions.length - 1 ? (_jsxs(Button, { variant: "hero", onClick: handleNextQuestion, children: ["Next Question", _jsx(ArrowRight, { className: "h-4 w-4" })] })) : (_jsxs(Button, { variant: "success", children: [_jsx(Trophy, { className: "h-4 w-4" }), "View Results"] })) })] })] }) }) }));
};
export default QuizMode;
