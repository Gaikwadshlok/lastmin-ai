import React, { useState, useEffect, useRef } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  duration: number;
  scale: number;
  rotation: number;
}

const GlobalSparkles: React.FC = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSparkleTime = useRef(0);
  const throttleDelay = 100; // Slightly higher delay for global effect

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastSparkleTime.current < throttleDelay) {
        return;
      }
      lastSparkleTime.current = now;

      // Check if the target element is clickable/interactive
      const target = event.target as HTMLElement;
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
      const newSparkle: Sparkle = {
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

  return (
    <>
      <style>{`
        @keyframes global-sparkle-fade {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              top: `${sparkle.y}px`,
              left: `${sparkle.x}px`,
              width: '35px',
              height: '35px',
              backgroundColor: 'white',
              clipPath: 'polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)',
              transform: `translate(-50%, -50%) scale(${sparkle.scale}) rotate(${sparkle.rotation}deg)`,
              filter: 'drop-shadow(0 0 4px white) drop-shadow(0 0 12px #bfdbfe)',
              animation: `global-sparkle-fade ${sparkle.duration}s ease-out forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default GlobalSparkles;
