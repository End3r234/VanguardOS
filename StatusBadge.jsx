import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  '10-8':  { label: '10-8', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  '10-7':  { label: '10-7', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  '10-6':  { label: '10-6', color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  '10-42': { label: '10-42', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25' },
  '10-97': { label: '10-97', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  '10-11': { label: '10-11', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  '10-23': { label: '10-23', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
};

const PRIORITY_CONFIG = {
  'P1': { label: 'P1', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'P2': { label: 'P2', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'P3': { label: 'P3', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  'P4': { label: 'P4', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

export default function StatusBadge({ status, type = 'status', className }) {
  const config = type === 'priority' ? PRIORITY_CONFIG : STATUS_CONFIG;
  const c = config[status] || { label: status, color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25' };

  return (
    <span className={cn(
      'inline-flex items-center border font-inter text-[10px] font-semibold px-1.5 py-0.5 rounded-sm tracking-widest uppercase',
      c.color, className
    )}>
      {c.label}
    </span>
  );
}