import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import atlasIcon from '@/assets/icon-192.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.img
        src={atlasIcon}
        alt="Atlas"
        className={cn('rounded-xl object-contain', sizes[size])}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        style={{ willChange: 'transform' }}
      />
      {showText && (
        <span className={cn('font-display font-bold tracking-tight', textSizes[size])}>
          Atlas
        </span>
      )}
    </div>
  );
}
