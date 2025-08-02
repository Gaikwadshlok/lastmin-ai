import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// A component to render a single character with a reveal animation tied to progress.
const AnimatedCharacter = ({ char, progress, index, totalChars }: { 
    char: string; 
    progress: any; 
    index: number; 
    totalChars: number; 
}) => {
    // Defines the range of progress values over which the character will appear.
    // It starts fading in 5 "progress points" before its target and is fully visible at its target.
    const opacity = useTransform(
        progress,
        [(index / totalChars) * 100 - 5, (index / totalChars) * 100],
        [0, 1]
    );

    return (
        <motion.span style={{ opacity }}>
            {/* Use a non-breaking space for space characters to maintain layout */}
            {char === " " ? "\u00A0" : char}
        </motion.span>
    );
};

interface LoaderProps {
    progress: number;
    onFinished: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ progress, onFinished }) => {
    // Create a motion value for progress to drive the character animations
    const progressMotionValue = useMotionValue(progress);

    useEffect(() => {
        progressMotionValue.set(progress);
    }, [progress, progressMotionValue]);

    useEffect(() => {
        // When progress hits 100, notify the parent to start the exit transition
        if (progress >= 100) {
            // Wait a moment before triggering the exit animation
            setTimeout(onFinished, 1200);
        }
    }, [progress, onFinished]);

    // Define the text content for LastMin AI
    const headingLines = ["LastMin AI"];
    const paragraphLine = "Preparing your study environment";
    const allText = [...headingLines, paragraphLine];
    const totalChars = allText.join("").length;
    let charIndex = 0; // To keep track of the character index across all lines

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background text-white"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.8, delay: 0.3, ease: "easeInOut" } }}
        >
            <motion.div
                className="relative w-full max-w-5xl mx-auto p-8 text-center flex flex-col items-center justify-center min-h-screen"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.6 } }}
            >
                {/* Container for the letter-by-letter animated text */}
                <div className="text-center">
                    <motion.h1 
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase tracking-tight leading-tight mb-6"
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #e879f9 50%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {headingLines.map((line, lineIndex) => (
                            <div key={lineIndex} className="block">
                                {Array.from(line).map((char, charInLineIndex) => (
                                    <AnimatedCharacter
                                        key={charInLineIndex}
                                        char={char}
                                        progress={progressMotionValue}
                                        index={charIndex++}
                                        totalChars={totalChars}
                                    />
                                ))}
                            </div>
                        ))}
                    </motion.h1>
                    
                    {/* Progress bar */}
                    <motion.div 
                        className="w-full max-w-md mx-auto mb-8"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>
                        <motion.div 
                            className="text-center mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <span className="text-xs text-gray-400 font-medium">{progress}%</span>
                        </motion.div>
                    </motion.div>
                    
                    <div className="text-lg md:text-xl text-gray-300 font-light max-w-lg mx-auto">
                        {Array.from(paragraphLine).map((char, charInLineIndex) => (
                             <AnimatedCharacter
                                key={charInLineIndex}
                                char={char}
                                progress={progressMotionValue}
                                index={charIndex++}
                                totalChars={totalChars}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};