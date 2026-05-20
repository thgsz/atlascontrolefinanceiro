import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
  maskValue: (value: string) => string;
  maskCurrency: (amount: number) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = 'atlas-privacy-mode';

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isPrivate));
    } catch {}
  }, [isPrivate]);

  const togglePrivacy = useCallback(() => setIsPrivate((p) => !p), []);

  const maskValue = useCallback(
    (value: string) => (isPrivate ? '•••••' : value),
    [isPrivate]
  );

  const maskCurrency = useCallback(
    (amount: number) => {
      if (isPrivate) return 'R$ ••••';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);
    },
    [isPrivate]
  );

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, maskValue, maskCurrency }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy must be used within PrivacyProvider');
  return ctx;
}
