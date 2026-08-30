/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Layered Obsidian with Solar Flare
        base: '#080c1a',
        surface: '#0e1a2b',
        elevated: '#162a3f',
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-glow': 'rgba(245, 158, 11, 0.25)',
        'solar-amber': '#f59e0b',
        'solar-amber-glow': '#fbbf24',
        'sky-blue': '#38bdf8',
        emerald: '#10b981',
        rose: '#f43f5e',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['1.85rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        h2: ['1.15rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        mono: ['0.8rem', { lineHeight: '1.6', fontWeight: '400' }],
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        '3xs': ['0.58rem', { lineHeight: '0.9rem' }],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glass-hover': '0 16px 48px rgba(0, 0, 0, 0.65), 0 0 24px rgba(245, 158, 11, 0.12)',
        'amber-glow': '0 0 24px rgba(245, 158, 11, 0.3)',
        'sky-glow': '0 0 24px rgba(56, 189, 248, 0.3)',
        'emerald-glow': '0 0 24px rgba(16, 185, 129, 0.3)',
      },
      borderRadius: {
        'panel': '16px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
}
