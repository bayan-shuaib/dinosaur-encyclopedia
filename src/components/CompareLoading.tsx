import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Compiling Fossil Records…',
  'Analyzing Morphology…',
  'Reconstructing Specimens…',
  'Preparing Comparative Analysis…',
];

interface Props {
  onComplete: () => void;
}

export default function CompareLoading({ onComplete }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 900);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const duration = 3500;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(onComplete, 300);
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  // Generate particles
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
  }));

  const circumference = 2 * Math.PI * 38;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Fossil dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-accent"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -30, 10, -20, 0],
              x: [0, 15, -10, 5, 0],
              opacity: [0, p.opacity, p.opacity * 0.5, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Progress ring */}
      <div className="relative mb-10">
        <svg width="90" height="90" viewBox="0 0 90 90">
          {/* Track */}
          <circle
            cx="45" cy="45" r="38"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          {/* Progress arc */}
          <motion.circle
            cx="45" cy="45" r="38"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 45 45)"
            style={{ filter: 'drop-shadow(0 0 6px hsl(30 10% 50% / 0.5))' }}
          />
        </svg>
        {/* Fossil icon in center */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </motion.div>
      </div>

      {/* Cycling messages */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="text-sm tracking-[0.15em] uppercase text-muted-foreground font-body"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.3), transparent)',
        }}
        animate={{ top: ['20%', '80%', '20%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
