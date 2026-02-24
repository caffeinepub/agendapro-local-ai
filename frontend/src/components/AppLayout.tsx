import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Menu,
  X,
  Heart,
  LayoutDashboard,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/clients', label: 'Clientes', icon: Users },
  { path: '/financials', label: 'Financeiro', icon: DollarSign },
  { path: '/retention', label: 'Retenção', icon: TrendingUp },
  { path: '/reminders', label: 'Lembretes', icon: Bell },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <img
          src="/assets/generated/agendapro-logo.dim_128x128.png"
          alt="AgendaPro"
          className="w-9 h-9 rounded-lg object-cover"
        />
        <div>
          <h1 className="font-display font-bold text-sidebar-foreground text-base leading-tight">
            AgendaPro
          </h1>
          <p className="text-xs text-sidebar-foreground/50 font-medium tracking-wide">
            Local AI
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path || currentPath.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/30 text-center">
          © {new Date().getFullYear()} AgendaPro
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-sidebar sidebar-bg">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar sidebar-bg flex flex-col lg:hidden transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/agendapro-logo.dim_128x128.png"
              alt="AgendaPro"
              className="w-7 h-7 rounded-md object-cover"
            />
            <span className="font-display font-bold text-foreground">AgendaPro</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-6 py-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>Feito com</span>
          <Heart className="w-3 h-3 fill-primary text-primary" />
          <span>usando</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'agendapro-local-ai')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
