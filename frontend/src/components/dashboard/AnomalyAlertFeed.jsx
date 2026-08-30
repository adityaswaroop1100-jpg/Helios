import React from 'react';
import { AlertTriangle, CheckCircle2, Flame, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AnomalyAlertFeed({
  events = [],
  className,
}) {
  const sampleEvents = events.length > 0
    ? events
    : [
        {
          id: 'ev-1',
          time: '14:22:04',
          title: 'Diode Bypass Fault Isolated (String A-7)',
          desc: 'P1000 MLPE reported voltage collapse (42.1V -> 4.2V). Electronic DC contactor isolated string in 12ms.',
          severity: 'CRITICAL',
          source: 'RTU Sensor #7',
        },
        {
          id: 'ev-2',
          time: '13:45:10',
          title: 'BESS Standing Reserve Auto-Dispatch',
          desc: 'Transient cloud occlusion compensated. Dispatched +3.8 kW buffer to eliminate frequency droop.',
          severity: 'NOMINAL',
          source: 'BESS Controller',
        },
        {
          id: 'ev-3',
          time: '12:00:00',
          title: 'Solar Zenith Astronomical Alignment',
          desc: 'Single-axis tracker achieved 0.0° optimal normal incidence angle. Inverter efficiency at 98.4%.',
          severity: 'INFO',
          source: 'Astronomical Kinematics',
        },
      ];

  return (
    <div className={cn('glass-panel p-24 flex flex-col justify-between', className)}>
      <div className="flex items-center justify-between pb-12 mb-16 border-b border-border-subtle">
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 rounded-lg bg-surface border border-border-glow flex items-center justify-center text-rose shadow-sm">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="text-h2 font-semibold text-text-primary tracking-tight">Live SCADA Anomaly Audit Feed</h2>
            <p className="text-mono text-xs text-text-muted mt-2">Millisecond Incident Resolution Log</p>
          </div>
        </div>
        <span className="text-mono text-2xs font-bold px-8 py-4 rounded-full bg-surface border border-border-subtle text-text-secondary">
          STREAMING 100 Hz
        </span>
      </div>

      <div className="space-y-12 my-auto">
        {sampleEvents.map((ev) => {
          const isCritical = ev.severity === 'CRITICAL';
          const isNominal = ev.severity === 'NOMINAL';

          return (
            <div
              key={ev.id}
              className={cn(
                'p-16 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-12 transition-all',
                isCritical
                  ? 'bg-rose/10 border-rose/30'
                  : isNominal
                  ? 'bg-emerald/10 border-emerald/30'
                  : 'bg-surface/60 border-border-subtle'
              )}
            >
              <div className="flex items-start gap-12">
                <div
                  className={cn(
                    'w-32 h-32 rounded-lg flex items-center justify-center shrink-0 mt-2',
                    isCritical
                      ? 'bg-rose/20 text-rose'
                      : isNominal
                      ? 'bg-emerald/20 text-emerald'
                      : 'bg-surface text-sky-blue'
                  )}
                >
                  {isCritical ? (
                    <AlertTriangle size={15} />
                  ) : isNominal ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Clock size={15} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-8 flex-wrap mb-4">
                    <span className="font-semibold text-xs text-text-primary">{ev.title}</span>
                    <span className="text-mono text-3xs px-6 py-2 rounded-full bg-base border border-border-subtle text-text-muted">
                      {ev.source}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-xl">{ev.desc}</p>
                </div>
              </div>

              <div className="text-mono text-3xs text-text-muted font-display shrink-0 text-right">
                {ev.time}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 pt-12 border-t border-border-subtle flex items-center justify-between text-mono text-xs text-text-muted">
        <span>Cloud Database: Google Firebase Firestore</span>
        <span className="text-solar-amber font-semibold">Zero Disk Footprint</span>
      </div>
    </div>
  );
}
