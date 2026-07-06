import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
// A component to render a single character with a reveal animation tied to progress.
const AnimatedCharacter = ({ char, progress, index, totalChars }) => {
    // Defines the range of progress values over which the character will appear.
    // It starts fading in 5 "progress points" before its target and is fully visible at its target.
    const opacity = useTransform(progress, [(index / totalChars) * 100 - 5, (index / totalChars) * 100], [0, 1]);
    return (_jsx(motion.span, { style: { opacity }, children: char === " " ? "\u00A0" : char }));
};
export const Loader = ({ progress, onFinished }) => {
    const [showLoader, setShowLoader] = useState(false);
    // Create a motion value for progress to drive the character animations
    const progressMotionValue = useMotionValue(progress);
    useEffect(() => {
        progressMotionValue.set(progress);
    }, [progress, progressMotionValue]);
    useEffect(() => {
        // Check if the loader has already been shown
        const hasLoadedBefore = localStorage.getItem('hasLoadedBefore');
        if (!hasLoadedBefore) {
            setShowLoader(true); // Show the loader for the first time
            localStorage.setItem('hasLoadedBefore', 'true'); // Mark as shown
        }
        else {
            setShowLoader(false); // Skip the loader on subsequent loads
            onFinished(); // Immediately signal finished so parent stops waiting
        }
    }, [onFinished]);
    useEffect(() => {
        // When progress hits 100, notify the parent to start the exit transition
        if (progress >= 100 && showLoader) {
            // Wait a moment before triggering the exit animation
            setTimeout(() => {
                setShowLoader(false);
                onFinished();
            }, 1200);
        }
    }, [progress, onFinished, showLoader]);
    if (!showLoader) {
        return null; // Skip rendering the loader
    }
    // Define the text content for LastMin AI
    const headingLines = ["LastMin AI"];
    const paragraphLine = "Preparing your study environment";
    const allText = [...headingLines, paragraphLine];
    const totalChars = allText.join("").length;
    let charIndex = 0; // To keep track of the character index across all lines
    return (_jsx(motion.div, { className: "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background text-white", exit: { opacity: 0, scale: 0.95, transition: { duration: 0.8, delay: 0.3, ease: "easeInOut" } }, children: _jsx(motion.div, { className: "relative w-full max-w-5xl mx-auto p-8 text-center flex flex-col items-center justify-center min-h-screen", initial: { opacity: 0, y: 30, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 1, ease: "easeOut" }, exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.6 } }, children: _jsxs("div", { className: "text-center", children: [_jsx(motion.h1, { className: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase tracking-tight leading-tight mb-6", style: {
                            background: 'linear-gradient(135deg, #ffffff 0%, #e879f9 50%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }, initial: { scale: 0.8 }, animate: { scale: 1 }, transition: { duration: 0.8, delay: 0.2 }, children: headingLines.map((line, lineIndex) => (_jsx("div", { className: "block", children: Array.from(line).map((char, charInLineIndex) => (_jsx(AnimatedCharacter, { char: char, progress: progressMotionValue, index: charIndex++, totalChars: totalChars }, charInLineIndex))) }, lineIndex))) }), _jsxs(motion.div, { className: "w-full max-w-md mx-auto mb-8", initial: { opacity: 0, width: 0 }, animate: { opacity: 1, width: "100%" }, transition: { duration: 0.6, delay: 0.5 }, children: [_jsx("div", { className: "h-1 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm", children: _jsx(motion.div, { className: "h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50", initial: { width: 0 }, animate: { width: `${progress}%` }, transition: { duration: 0.3, ease: "easeOut" } }) }), _jsx(motion.div, { className: "text-center mt-2", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.8 }, children: _jsxs("span", { className: "text-xs text-gray-400 font-medium", children: [progress, "%"] }) })] }), _jsx("div", { className: "text-lg md:text-xl text-gray-300 font-light max-w-lg mx-auto", children: Array.from(paragraphLine).map((char, charInLineIndex) => (_jsx(AnimatedCharacter, { char: char, progress: progressMotionValue, index: charIndex++, totalChars: totalChars }, charInLineIndex))) })] }) }) }));
};
