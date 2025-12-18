import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  variant = 'default',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 p-6 bg-card hover-lift',
        variant === 'primary' && 'border-primary/30 bg-primary/5',
        variant === 'success' && 'border-success/30 bg-success/5',
        variant === 'warning' && 'border-warning/30 bg-warning/5',
        variant === 'destructive' && 'border-destructive/30 bg-destructive/5',
        className
      )}
    >
      {/* Background glow */}
      {variant === 'primary' && (
        <div className="absolute inset-0 gradient-glow opacity-50" />
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                'text-3xl font-bold tracking-tight',
                variant === 'primary' && 'text-primary',
                variant === 'success' && 'text-success',
                variant === 'warning' && 'text-warning',
                variant === 'destructive' && 'text-destructive'
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div
              className={cn(
                'p-3 rounded-lg',
                variant === 'default' && 'bg-muted',
                variant === 'primary' && 'bg-primary/20 text-primary',
                variant === 'success' && 'bg-success/20 text-success',
                variant === 'warning' && 'bg-warning/20 text-warning',
                variant === 'destructive' && 'bg-destructive/20 text-destructive'
              )}
            >
              {icon}
            </div>
          )}
        </div>
        
        {trend && trendValue && (
          <div className="mt-4 flex items-center gap-1">
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
