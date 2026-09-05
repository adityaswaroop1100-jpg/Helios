import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

const SAMPLE_EVENTS = [
  {
    id: 'ev-1',
    time: '14:32:21',
    title: 'String #3 Bypass Diode Fault — Auto-Isolated',
    desc: 'String conductor anomaly detected. Solid-state DC breaker tripped in <12ms. BESS dispatch compensating.',
    severity: 'CRITICAL',
    source: 'SCADA Engine',
  },
  {
    id: 'ev-2',
    time: '12:00:00',
    title: 'Solar Zenith Alignment — Peak Tracking Active',
    desc: 'Astronomical tracker achieved 0.0° normal incidence. Inverter efficiency at 98.4%. MPPT locked to 641V.',
    severity: 'NOMINAL',
    source: 'Kinematic RTU',
  },
  {
    id: 'ev-3',
    time: '09:14:37',
    title: 'Cloud Transient — Irradiance Suppressed 34%',
    desc: 'Localized cumulus occlusion (cloud index 0.72). BESS auto-dispatch prevented generation gap. Cleared in 41s.',
    severity: 'INFO',
    source: 'Weather Engine',
  },
];

const SEV_STYLE = {
  CRITICAL: { color: '#e5484d', bg: 'rgba(229,72,77,0.10)', border: 'rgba(229,72,77,0.22)', Icon: AlertTriangle },
  NOMINAL:  { color: '#2dd4a8', bg: 'rgba(45,212,168,0.10)', border: 'rgba(45,212,168,0.20)', Icon: CheckCircle2 },
  INFO:     { color: '#4dd0e1', bg: 'rgba(77,208,225,0.08)', border: 'rgba(77,208,225,0.18)', Icon: Clock },
};

export default function AnomalyAlertFeed({ className = '' }) {
  const events = SAMPLE_EVENTS;

  return (
    <div className={`data-card rounded-xl2 p-5 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(229,72,77,0.10)', border: '1px solid rgba(229,72,77,0.22)' }}>
            <ShieldAlert size={15} className="text-crimson" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">Live SCADA Anomaly Audit</h2>
            <p className="text-3xs text-text-muted font-mono mt-0.5">Millisecond Incident Resolution Log</p>
          </div>
        </div>
        <span className="badge-cyan">100 Hz</span>
      </div>

      {/* Events */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {events.map((ev) => {
          const s = SEV_STYLE[ev.severity] || SEV_STYLE.INFO;
          const SevIcon = s.Icon;
          return (
            <div
              key={ev.id}
              className="p-3 rounded-xl flex items-start justify-between gap-2.5 transition-all"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: s.bg, color: s.color }}>
                  <SevIcon size={13} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-2xs text-text-primary">{ev.title}</span>
                    <span className="text-3xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#7a8ba3', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {ev.source}
                    </span>
                  </div>
                  <p className="text-3xs text-text-secondary leading-relaxed">{ev.desc}</p>
                </div>
              </div>
              <span className="font-mono text-3xs text-text-muted shrink-0">{ev.time}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 flex items-center justify-between font-mono text-3xs text-text-muted"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span>Firebase Firestore · Zero Local Disk</span>
        <span className="text-gold font-semibold">Zero Disk Footprint</span>
      </div>
    </div>
  );
}
