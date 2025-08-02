import React, { useState, useEffect, useRef } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  duration: number;
  scale: number;
  rotation: number;
}

interface SparkleContainerProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

const SparkleContainer: React.FC<SparkleContainerProps> = ({ 
  children, 
  className = "", 
  enabled = true 
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSparkleTime = useRef(0);
  const throttleDelay = 75;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;

    const now = Date.now();
    if (now - lastSparkleTime.current < throttleDelay) {
      return;
    }
    lastSparkleTime.current = now;

    const { clientX, clientY, currentTarget } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    // Create a new sparkle with randomized animation properties
    const newSparkle: Sparkle = {
      id: now,
      x,
      y,
      duration: Math.random() * 0.6 + 0.6, // Random duration between 0.6s and 1.2s
      scale: Math.random() * 0.8 + 0.5, // Random scale between 0.5 and 1.3
      rotation: Math.random() * 180 - 90, // Random rotation between -90deg and 90deg
    };

    setSparkles(prevSparkles => [...prevSparkles, newSparkle]);
  };

  // This effect cleans up old sparkles
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      // Remove sparkles older than the max animation time (1.2s)
      setSparkles(currentSparkles => currentSparkles.filter(s => now - s.id < 1200));
    }, 500);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Clear all sparkles when the mouse leaves the container
  const handleMouseLeave = () => {
    setSparkles([]);
  };

  return (
    <>
      <style>{`
        @keyframes sparkle-fade {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
      <div 
        className={`relative overflow-hidden ${enabled ? 'cursor-crosshair' : ''} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {enabled && sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none z-50"
            style={{
              top: `${sparkle.y}px`,
              left: `${sparkle.x}px`,
              width: '45px',
              height: '45px',
              backgroundColor: 'white',
              clipPath: 'polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)',
              transform: `translate(-50%, -50%) scale(${sparkle.scale}) rotate(${sparkle.rotation}deg)`,
              filter: 'drop-shadow(0 0 5px white) drop-shadow(0 0 15px #bfdbfe)',
              animation: `sparkle-fade ${sparkle.duration}s ease-out forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default SparkleContainer;
