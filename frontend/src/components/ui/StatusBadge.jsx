import React from 'react';
import { cn } from '../../lib/utils';

export default function StatusBadge({
  status = 'online', // 'online' | 'derating' | 'fault' | 'standby' | 'sync'
  label,
  showDot = true,
  className,
}) {
  const config = {
    online: {
      dot: 'bg-emerald shadow-emerald-glow',
      bg: 'bg-emerald/10 border-emerald/30 text-emerald',
      text: label || 'NOMINAL 100%',
    },
    derating: {
      dot: 'bg-solar-amber shadow-amber-glow',
      bg: 'bg-solar-amber/10 border-solar-amber/30 text-solar-amber',
      text: label || 'DERATING ACTIVE',
    },
    fault: {
      dot: 'bg-rose shadow-[0_0_12px_rgba(244,63,94,0.6)]',
      bg: 'bg-rose/10 border-rose/30 text-rose',
      text: label || 'FAULT DETECTED',
    },
    standby: {
      dot: 'bg-sky-blue shadow-sky-glow',
      bg: 'bg-sky-blue/10 border-sky-blue/30 text-sky-blue',
      text: label || 'STANDBY 84%',
    },
    sync: {
      dot: 'bg-solar-amber-glow shadow-amber-glow animate-pulse',
      bg: 'bg-solar-amber/15 border-solar-amber/40 text-solar-amber-glow',
      text: label || 'FIREBASE SYNCED',
    },
  }[status] || {
    dot: 'bg-emerald',
    bg: 'bg-emerald/10 border-emerald/30 text-emerald',
    text: label || status.toUpperCase(),
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-6 px-8 py-4 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border shadow-sm',
        config.bg,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-6 h-6 rounded-full inline-block', config.dot)} />
      )}
      <span>{config.text}</span>
    </span>
  );
}
