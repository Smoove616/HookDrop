import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isPlaying, 
  currentTime, 
  duration,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const numBars = Math.floor(rect.width / 4);
    const barWidth = rect.width / numBars;
    const progress = duration > 0 ? currentTime / duration : 0;

    // Initialize bars if needed
    if (barsRef.current.length !== numBars) {
      barsRef.current = Array.from({ length: numBars }, () => Math.random());
    }

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let i = 0; i < numBars; i++) {
        // Smooth animation
        if (isPlaying) {
          barsRef.current[i] += (Math.random() - 0.5) * 0.15;
          barsRef.current[i] = Math.max(0.1, Math.min(1, barsRef.current[i]));
        }

        const barHeight = barsRef.current[i] * rect.height * 0.85;
        const x = i * barWidth;
        const isPassed = i / numBars < progress;
        
        // Gradient colors
        const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
        if (isPassed) {
          gradient.addColorStop(0, '#a78bfa');
          gradient.addColorStop(1, '#8b5cf6');
        } else {
          gradient.addColorStop(0, '#6b7280');
          gradient.addColorStop(1, '#4b5563');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, (rect.height - barHeight) / 2, barWidth - 2, barHeight);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full rounded-lg ${className}`}
      style={{ height: '60px' }}
    />
  );
};
