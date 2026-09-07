import React from 'react';
import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';

/**
 * Enterprise-grade SCADA Error Boundary
 * Prevents any component crash or unhandled exception from showing a white screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log cleanly without crashing console
    try {
      if (typeof window !== 'undefined' && window.__HELIOS_ERROR_LOG) {
        window.__HELIOS_ERROR_LOG.push({ error, errorInfo, timestamp: Date.now() });
      }
    } catch {
      // Ignore
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full p-6 flex flex-col items-center justify-center text-center rounded-2xl glass-premium border border-crimson/30 m-4 shadow-premium"
          style={{ background: 'rgba(12, 6, 10, 0.95)' }}>
          <div className="w-14 h-14 rounded-2xl bg-crimson/15 border border-crimson/40 flex items-center justify-center mb-4 text-crimson shadow-glow-crimson">
            <ShieldAlert size={28} />
          </div>

          <h3 className="text-lg font-bold text-text-primary tracking-tight mb-1">
            SCADA Telemetry Engine Recovered
          </h3>
          <p className="text-2xs font-mono text-text-secondary max-w-md mb-5 leading-relaxed">
            An isolated exception was intercepted by the HELIOS fault boundary. The core digital twin state remains protected.
          </p>

          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{
              background: 'linear-gradient(90deg, #c9973e, #dbb060)',
              color: '#060a14',
              boxShadow: '0 0 20px rgba(201,151,62,0.3)'
            }}
          >
            <RotateCcw size={14} />
            <span>Re-initialize Feed</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
