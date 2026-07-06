import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
const GlobalSparkles = () => {
    const [sparkles, setSparkles] = useState([]);
    const lastSparkleTime = useRef(0);
    const throttleDelay = 100; // Slightly higher delay for global effect
    useEffect(() => {
        const handleMouseMove = (event) => {
            const now = Date.now();
            if (now - lastSparkleTime.current < throttleDelay) {
                return;
            }
            lastSparkleTime.current = now;
            // Check if the target element is clickable/interactive
            const target = event.target;
            const isInteractive = target.closest('button') ||
                target.closest('a') ||
                target.closest('[role="tab"]') ||
                target.closest('[role="button"]') ||
                target.closest('input') ||
                target.closest('select') ||
                target.closest('textarea') ||
                target.closest('.no-sparkle') ||
                target.hasAttribute('tabindex') ||
                getComputedStyle(target).cursor === 'pointer';
            // Don't create sparkles on interactive elements
            if (isInteractive) {
                return;
            }
            const x = event.clientX;
            const y = event.clientY;
            // Create a new sparkle with randomized animation properties
            const newSparkle = {
                id: now,
                x,
                y,
                duration: Math.random() * 0.6 + 0.6, // Random duration between 0.6s and 1.2s
                scale: Math.random() * 0.6 + 0.4, // Slightly smaller for global effect
                rotation: Math.random() * 180 - 90, // Random rotation between -90deg and 90deg
            };
            setSparkles(prevSparkles => [...prevSparkles, newSparkle]);
        };
        // Add global mouse move listener
        document.addEventListener('mousemove', handleMouseMove);
        // Cleanup interval for old sparkles
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setSparkles(currentSparkles => currentSparkles.filter(s => now - s.id < 1200));
        }, 500);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            clearInterval(cleanupInterval);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        @keyframes global-sparkle-fade {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      ` }), _jsx("div", { className: "fixed inset-0 pointer-events-none z-50", children: sparkles.map((sparkle) => (_jsx("div", { className: "absolute pointer-events-none", style: {
                        top: `${sparkle.y}px`,
                        left: `${sparkle.x}px`,
                        width: '35px',
                        height: '35px',
                        backgroundColor: 'white',
                        clipPath: 'polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)',
                        transform: `translate(-50%, -50%) scale(${sparkle.scale}) rotate(${sparkle.rotation}deg)`,
                        filter: 'drop-shadow(0 0 4px white) drop-shadow(0 0 12px #bfdbfe)',
                        animation: `global-sparkle-fade ${sparkle.duration}s ease-out forwards`,
                    } }, sparkle.id))) })] }));
};
export default GlobalSparkles;
