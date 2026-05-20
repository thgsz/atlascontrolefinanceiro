import { motion } from 'framer-motion';
import atlasIcon from '@/assets/icon-192.png';

export function AnimatedLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <motion.img
          src={atlasIcon}
          alt="Atlas"
          className="w-12 h-12 rounded-xl"
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Carregando...
        </motion.p>
      </div>
    </div>
  );
}
