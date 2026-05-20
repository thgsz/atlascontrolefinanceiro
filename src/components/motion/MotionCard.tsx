import { HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'children' | 'className'> {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function MotionCard({ children, delay = 0, className, ...props }: MotionCardProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
