import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl glass p-5',
        hover && 'hover:bg-white/[0.06] transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}