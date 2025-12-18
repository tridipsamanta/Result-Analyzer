import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Home, Users, GitCompare, PieChart } from 'lucide-react';
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
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">
                Result Analyzer
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Smart Marks Parser</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-1">
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
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
