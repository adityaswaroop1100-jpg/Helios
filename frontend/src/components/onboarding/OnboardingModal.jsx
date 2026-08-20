import React, { useState } from 'react';
import { Clock, MousePointer, Sliders, X, ArrowRight, Check } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onStartTour }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Clock className="text-emerald-400" size={24} />,
      title: 'Real-Time System Clock Sync',
      description: 'By default, Helios synchronizes with your actual local time. Sun position, irradiance, and kW output reflect real conditions right now.',
      highlight: 'Look for the green "Live Clock" button in the top navbar.'
    },
    {
      icon: <MousePointer className="text-sky-400" size={24} />,
      title: 'Interactive Module Telemetry',
      description: 'Click on any of the 12 solar panels in the 3D scene to open a live engineering telemetry card showing DC Voltage, Current, Cell Temp & Efficiency.',
      highlight: 'Try clicking Panel A-11 or Panel A-22 in the 3D grid.'
    },
    {
      icon: <Sliders className="text-amber-400" size={24} />,
      title: 'Diurnal Time Control & 3D Tour',
      description: 'Use the time-of-day slider to scrub through 24 hours of solar radiation, or launch our 3D Guided Tour to learn how the inverter and grid connection work.',
      highlight: 'Click "Start 3D Tour" anytime in the top bar.'
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 select-none relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Step Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            {current.icon}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400 font-mono">
              Welcome Guide • Step {step + 1} of {steps.length}
            </div>
            <h3 className="text-base font-bold text-white">{current.title}</h3>
          </div>
        </div>

        {/* Description & Highlight Box */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {current.description}
        </p>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 flex items-start gap-2">
          <span className="text-amber-400 font-bold text-sm shrink-0">💡</span>
          <span className="text-[11px] text-slate-300">{current.highlight}</span>
        </div>

        {/* Step Progress Dots & Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === step ? 'w-5 bg-sky-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {step < steps.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="px-4 py-2 bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-lg"
              >
                <span>Take 3D Guided Tour</span>
                <Check size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
