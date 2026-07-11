import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  CalendarRange,
  LineChart,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { path: '/categories', icon: Tags, label: 'Categorias' },
  { path: '/subscriptions', icon: CreditCard, label: 'Assinaturas' },
  { path: '/installments', icon: CalendarRange, label: 'Parcelas' },
  { path: '/investments', icon: LineChart, label: 'Investimentos' },
  { path: '/analytics', icon: BarChart3, label: 'Análises' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col border-r border-sidebar-border/60 z-50',
        'bg-sidebar/85 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/70',
        'transition-[width] duration-300 ease-out',
        collapsed ? 'w-20' : 'w-60'
      )}
      style={{
        boxShadow: 'inset -1px 0 0 hsl(var(--sidebar-border) / 0.5)',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 0% 0%, hsl(var(--primary) / 0.08), transparent 60%)',
        }}
      />

      {/* Header */}
      <div className="relative p-6 flex items-center justify-between">
        <Logo size="md" showText={!collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors active:scale-95"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium',
                'transition-colors duration-200 active:scale-[0.98]',
                isActive
                  ? 'text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl -z-0"
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary) / 0.06) 100%)',
                    boxShadow: 'inset 0 0 0 1px hsl(var(--primary) / 0.22)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_12px_hsl(var(--primary)/0.6)] z-10"
                />
              )}
              <Icon className={cn('w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-200', 'group-hover:scale-110')} />
              {!collapsed && <span className="relative z-10">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative p-4 border-t border-sidebar-border/60">
        <button
          onClick={() => signOut()}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground',
            'hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]',
            collapsed && 'justify-center'
          )}
          aria-label="Sair da conta"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
