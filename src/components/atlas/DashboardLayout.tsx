import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { AtlasCopilot } from './AtlasCopilot';
import { useProfile } from '@/hooks/useProfile';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';
import { useAuth } from '@/lib/auth-context';
import { Menu, X, UserCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: profile } = useProfile();
  const avatarSignedUrl = useAvatarUrl(profile?.avatar_url);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  // Subtle scrolled shadow for mobile header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 lg:hidden z-40',
          'bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60',
          'transition-[box-shadow,border-color,background-color] duration-300',
          scrolled
            ? 'border-b border-border/60 shadow-[0_8px_24px_-16px_hsl(var(--background))]'
            : 'border-b border-transparent'
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary/70 transition-colors active:scale-95"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-lg tracking-tight">Atlas</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors active:scale-95"
            aria-label="Sair da conta"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="rounded-full overflow-hidden w-9 h-9 border-2 border-primary/30 hover:border-primary transition-colors active:scale-95"
            aria-label="Abrir configurações"
          >
            {avatarSignedUrl ? (
              <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-md" />
            <motion.div
              className="relative w-64 h-full"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              style={{ willChange: 'transform' }}
            >
              <Sidebar />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors active:scale-95 z-10"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden"
        style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-[72px] lg:pt-8 pb-4 lg:pb-8">
          {children}
        </main>
        <Footer />
        <AtlasCopilot />
      </div>
    </div>
  );
}
