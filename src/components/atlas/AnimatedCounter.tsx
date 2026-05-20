import { useEffect, useRef, useState, useCallback } from 'react';
import { usePrivacy } from '@/lib/privacy-context';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 600, className }: AnimatedCounterProps) {
  const { isPrivate } = usePrivacy();
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(0);

  const format = useCallback((n: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n);
  }, []);

  useEffect(() => {
    if (isPrivate) {
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    cancelAnimationFrame(rafRef.current);
    startRef.current = 0;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(to);
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, isPrivate]);

  // Keep fromRef in sync when value settles
  useEffect(() => {
    fromRef.current = value;
  }, [value]);

  if (isPrivate) return <span className={className}>R$ ••••</span>;

  return <span className={className}>{format(display)}</span>;
}

