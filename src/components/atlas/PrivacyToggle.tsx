import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy-context';
import { cn } from '@/lib/utils';

interface PrivacyToggleProps {
  className?: string;
}

export function PrivacyToggle({ className }: PrivacyToggleProps) {
  const { isPrivate, togglePrivacy } = usePrivacy();

  return (
    <button
      onClick={togglePrivacy}
      className={cn(
        'p-2 rounded-xl transition-all duration-200',
        isPrivate
          ? 'bg-primary/15 text-primary hover:bg-primary/25'
          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
        className
      )}
      title={isPrivate ? 'Mostrar valores' : 'Ocultar valores'}
      aria-label={isPrivate ? 'Mostrar valores financeiros' : 'Ocultar valores financeiros'}
    >
      {isPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );
}
