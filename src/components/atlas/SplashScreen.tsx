import { motion, AnimatePresence } from 'framer-motion';
import atlasIcon from '@/assets/icon-192.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={() => {}}
      >
        {/* Glow background */}
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(173 80% 50% / 0.15) 0%, transparent 70%)',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.8, 0.5, 0.8, 0],
            scale: [0.5, 1.2, 1.1, 1.2, 1.5],
          }}
          transition={{
            duration: 1.3,
            times: [0, 0.3, 0.5, 0.7, 1],
            ease: 'easeInOut',
          }}
        />

        {/* Icon */}
        <motion.img
          src={atlasIcon}
          alt="Atlas"
          className="w-20 h-20 rounded-2xl relative z-10"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            scale: [0.85, 1, 1.03, 1, 0.95],
          }}
          transition={{
            duration: 1.3,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: 'easeInOut',
          }}
          onAnimationComplete={onComplete}
        />

        {/* Text */}
        <motion.span
          className="absolute mt-28 font-display font-bold text-xl tracking-tight text-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [6, 0, 0, -4],
          }}
          transition={{
            duration: 1.3,
            times: [0, 0.3, 0.7, 1],
            ease: 'easeInOut',
          }}
        >
          Atlas
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
}
