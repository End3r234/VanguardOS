import React from 'react';
import { PLATFORM_BADGES } from '@/lib/platformAuth';

export default function PlatformBadge({ badgeKey, small = false }) {
  const def = PLATFORM_BADGES[badgeKey];
  if (!def) return null;
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}
      style={{ color: def.color, background: def.bg, borderColor: def.border }}
    >
      {def.label}
    </span>
  );
}