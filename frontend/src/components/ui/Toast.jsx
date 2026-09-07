/**
 * HELIOS Toast System
 * Lightweight custom toast – no external dependency needed.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';

let _setToasts = null;
let _uid = 0;

export function toast(message, options = {}) {
  const type = options.type || 'info';
  const duration = options.duration ?? 4000;
  const id = ++_uid;
  _setToasts?.(prev => [...prev, { id, message, type, duration }]);
  return id;
}

toast.success = (msg, opts) => toast(msg, { ...opts, type: 'success' });
toast.warn    = (msg, opts) => toast(msg, { ...opts, type: 'warn' });
toast.info    = (msg, opts) => toast(msg, { ...opts, type: 'info' });
toast.scada   = (msg, opts) => toast(msg, { ...opts, type: 'scada', duration: opts?.duration ?? 5000 });

const TYPE_STYLES = {
  success: { color: '#2dd4a8', bg: 'rgba(45,212,168,0.12)', border: 'rgba(45,212,168,0.28)', Icon: CheckCircle2 },
  warn:    { color: '#c9973e', bg: 'rgba(201,151,62,0.12)', border: 'rgba(201,151,62,0.28)', Icon: AlertTriangle },
  info:    { color: '#4dd0e1', bg: 'rgba(77,208,225,0.10)', border: 'rgba(77,208,225,0.22)', Icon: Info },
  scada:   { color: '#e5484d', bg: 'rgba(229,72,77,0.12)', border: 'rgba(229,72,77,0.28)', Icon: Zap },
};

function ToastItem({ id, message, type, duration, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onRemove]);

  const s = TYPE_STYLES[type] || TYPE_STYLES.info;
  const Icon = s.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl max-w-sm w-full shadow-premium"
      style={{
        background: 'rgba(6,10,20,0.95)',
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.color}`,
        backdropFilter: 'blur(24px)',
        boxShadow: `0 16px 48px -8px rgba(0,0,0,0.9), 0 0 20px -8px ${s.color}30`,
      }}
    >
      <Icon size={16} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
      <p className="text-sm text-text-primary font-sans leading-snug flex-1">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-text-muted hover:text-text-primary transition-colors ml-1 mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _setToasts = setToasts;
    return () => { _setToasts = null; };
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed top-20 right-5 z-[9998] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onRemove={remove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
