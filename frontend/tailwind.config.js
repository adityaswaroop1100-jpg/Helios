/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          bg:      '#030810',
          card:    '#0a1829',
          surface: '#0e2038',
          edge:    '#14263e',
          primary: '#dde8f4',
          dim:     '#7e95b0',
          muted:   '#4a6180',
          accent:  '#f59e0b',
          amber:   '#fbbf24',
          green:   '#10b981',
          blue:    '#38bdf8',
          alert:   '#f43f5e',
          border:  '#0e2038',
          indigo:  '#818cf8',
        }
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        display: ['JetBrains Mono', 'monospace'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn:  '10px',
      },
      boxShadow: {
        card:    '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 48px rgba(0,0,0,0.5)',
        glow:    '0 0 28px rgba(245,158,11,0.14)',
        'glow-sky':     '0 0 28px rgba(56,189,248,0.15)',
        'glow-emerald': '0 0 28px rgba(16,185,129,0.15)',
        panel:   '0 2px 20px rgba(0,0,0,0.4)',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        '3xs': ['0.58rem', { lineHeight: '0.9rem' }],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
}
