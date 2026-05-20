import { ReactNode, ButtonHTMLAttributes } from 'react';

interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function MotionButton({ children, className, ...props }: MotionButtonProps) {
  return (
    <button
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
