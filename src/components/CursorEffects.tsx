import { useEffect, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export default function CursorEffects() {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;
    let trailId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Add new trail point
      setTrail(currentTrail => {
        const newPoint = { x: e.clientX, y: e.clientY, id: trailId++ };
        return [...currentTrail, newPoint].slice(-20); // Keep last 20 points
      });
    };

    const animateTrail = () => {
      setTrail(currentTrail => 
        currentTrail.map((point, index) => ({
          ...point,
          x: point.x + (Math.random() - 0.5) * 0.5,
          y: point.y + (Math.random() - 0.5) * 0.5
        })).filter((_, index) => index >= currentTrail.length - 15)
      );
      
      animationFrameId = requestAnimationFrame(animateTrail);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Lightning Trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="lightning-trail absolute"
          style={{
            left: point.x - 2,
            top: point.y - 2,
            opacity: (index + 1) / trail.length * 0.8,
            transform: `scale(${(index + 1) / trail.length})`,
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
          }}
        />
      ))}

      {/* Main Cursor Glow */}
      <div
        className="absolute w-8 h-8 bg-gradient-primary rounded-full opacity-30 blur-sm transition-transform duration-75"
        style={{
          left: mousePos.x - 16,
          top: mousePos.y - 16,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}