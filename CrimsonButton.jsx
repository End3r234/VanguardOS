import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CrimsonButton({ children, className, variant = 'default', ...props }) {
  if (variant === 'outline') {
    return (
      <Button
        className={cn(
          'border border-crimson/40 bg-crimson/10 text-crimson hover:bg-crimson/20 rounded-xl font-inter font-medium transition-all',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
  if (variant === 'ghost') {
    return (
      <Button
        variant="ghost"
        className={cn(
          'text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-inter',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button
      className={cn(
        'bg-gradient-to-r from-crimson to-crimson-dark hover:from-crimson-light hover:to-crimson text-white rounded-xl font-inter font-semibold shadow-lg shadow-crimson/20 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}