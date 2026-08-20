import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, CheckCircle2, Loader2, BatteryCharging, X } from 'lucide-react';
import { getRecommendations } from '../../api/forecastApi';

// Action status flow: idle → dispatching → active → (auto-reset after 10s)
function useActionDispatch() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'dispatching' | 'active'
  const [confirmedLabel, setConfirmedLabel] = useState('');

  const dispatch = (label) => {
    if (status !== 'idle') return;
    setConfirmedLabel(label);
    setStatus('dispatching');
    // Simulate SCADA command round-trip (1.4s)
    setTimeout(() => setStatus('active'), 1400);
  };

  const reset = () => {
    setStatus('idle');
    setConfirmedLabel('');
  };

  // Auto-reset after 10s of "active" so button can be re-triggered
  useEffect(() => {
    if (status === 'active') {
      const t = setTimeout(reset, 10000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return { status, confirmedLabel, dispatch, reset };
}

export default function RecommendationBanner({ currentHourData }) {
  const recommendation = getRecommendations(currentHourData);
  const { status, confirmedLabel, dispatch, reset } = useActionDispatch();

  const handleAction = () => {
    dispatch(recommendation.actionText);
  };

  return (
    <div className="bg-[#141619] border border-[#2a2d32] rounded-sm p-4 shadow-none relative font-mono overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left — Icon + Text */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-sm bg-[#1f2328] border border-[#2a2d32] text-[#f0a830] shrink-0">
            <Zap size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#9ca3af]">
                SCADA DECISION SUPPORT ENGINE
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-[#1f2328] border border-[#2a2d32] text-[#f0a830]">
                {recommendation.type}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mt-1 uppercase tracking-wider">
              {recommendation.title}
            </h3>

            <p className="text-xs text-[#9ca3af] mt-0.5 max-w-2xl font-sans">
              {recommendation.description}
            </p>
          </div>
        </div>

        {/* Right — Action Button / Status */}
        <div className="shrink-0 self-end sm:self-center">
          {status === 'idle' && (
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-[#1f2328] hover:bg-[#2a2d32] active:bg-[#f0a830]/10 text-[#f0a830] border border-[#2a2d32] hover:border-[#f0a830]/50 font-bold text-xs rounded-sm transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer select-none"
            >
              <span>{recommendation.actionText}</span>
              <ArrowRight size={14} />
            </button>
          )}

          {status === 'dispatching' && (
            <div className="px-4 py-2 bg-[#1f2328] border border-[#f0a830]/40 text-[#f0a830] font-bold text-xs rounded-sm flex items-center gap-2 uppercase tracking-wider select-none">
              <Loader2 size={14} className="animate-spin" />
              <span>DISPATCHING COMMAND…</span>
            </div>
          )}

          {status === 'active' && (
            <button
              onClick={reset}
              className="px-4 py-2 bg-[#062419] border border-[#10b981]/50 text-[#10b981] font-bold text-xs rounded-sm flex items-center gap-2 uppercase tracking-wider hover:bg-[#0a3327] transition-colors cursor-pointer select-none"
              title="Click to reset"
            >
              <CheckCircle2 size={14} />
              <span>COMMAND ACTIVE</span>
              <X size={12} className="text-[#9ca3af] hover:text-white ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Panel — slides in from bottom when active */}
      {status === 'active' && (
        <div className="mt-3 pt-3 border-t border-[#2a2d32] flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#10b981]">
            <BatteryCharging size={16} />
            <span className="font-bold uppercase tracking-wider">BESS ROUTING ACTIVE</span>
          </div>

          <div className="flex flex-wrap gap-3 font-mono text-[#c7ccd4]">
            <div className="flex items-center gap-1.5 bg-[#0b0c0e] border border-[#2a2d32] px-2.5 py-1 rounded-sm">
              <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">SURPLUS ROUTED:</span>
              <span className="text-[#10b981] font-bold tabular-nums">
                {currentHourData.predictedKW > 25
                  ? (currentHourData.predictedKW - 25).toFixed(1)
                  : '0.0'} kW
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b0c0e] border border-[#2a2d32] px-2.5 py-1 rounded-sm">
              <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">BESS CHARGE RATE:</span>
              <span className="text-[#f0a830] font-bold tabular-nums">
                {currentHourData.predictedKW > 25
                  ? ((currentHourData.predictedKW - 25) * 0.96).toFixed(1)
                  : '0.0'} kW
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b0c0e] border border-[#2a2d32] px-2.5 py-1 rounded-sm">
              <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">INVERTER MODE:</span>
              <span className="text-[#c7ccd4] font-bold">SELF-CONSUMPTION + BESS</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b0c0e] border border-[#2a2d32] px-2.5 py-1 rounded-sm">
              <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">COMMAND ID:</span>
              <span className="text-[#9ca3af] tabular-nums">
                SCADA-{Date.now().toString().slice(-5)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
