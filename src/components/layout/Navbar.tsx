import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Home, Users, GitCompare, PieChart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useDatasetStore } from '@/store/datasetStore';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/compare', label: 'Compare', icon: GitCompare },
  { path: '/analytics', label: 'Analytics', icon: PieChart },
];

export function Navbar() {
  const location = useLocation();
  const { currentDataset } = useDatasetStore();
  
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-primary/5">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight text-foreground">Result Analyzer</h1>
              <p className="text-xs text-muted-foreground">Smart Marks Analyzer</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              const isDisabled = path !== '/' && !currentDataset;

              return (
                <Link
                  key={path}
                  to={isDisabled ? '#' : path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] sm:w-80 border-l border-border/70 bg-card/90 backdrop-blur-xl p-0">
              <SheetHeader className="px-5 pt-5 pb-4 text-left">
                <SheetTitle className="text-lg font-semibold text-foreground">Navigate</SheetTitle>
                <p className="text-sm text-muted-foreground">Quick access</p>
              </SheetHeader>

              <div className="space-y-2 px-3 pb-6">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path;
                  const isDisabled = path !== '/' && !currentDataset;

                  return (
                    <SheetClose asChild key={path}>
                      <Link
                        to={isDisabled ? '#' : path}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all',
                          isActive
                            ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                            : 'text-foreground hover:bg-secondary',
                          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                        )}
                      >
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span>{label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
