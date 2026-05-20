import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Footer } from './Footer';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
