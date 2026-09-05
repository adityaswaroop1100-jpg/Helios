/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── DEEP SPACE BACKGROUND ──
        carbon:       '#060a14',
        'carbon-mid': '#090f1e',
        'carbon-light': '#0c1428',
        surface:      '#101828',

        // ── METALLIC ACCENT PALETTE ──
        gold:         '#c9973e',  // Aged Bullion
        'gold-light':  '#dbb060',
        'gold-dim':    'rgba(201,151,62,0.15)',
        cyan:         '#4dd0e1',  // Tiffany Cerulean
        'cyan-dim':    'rgba(77,208,225,0.12)',
        jade:         '#2dd4a8',  // Mint Jade
        'jade-dim':    'rgba(45,212,168,0.12)',
        crimson:      '#e5484d',  // Alarm Red
        'crimson-dim': 'rgba(229,72,77,0.12)',

        // ── TEXT HIERARCHY ──
        'text-primary':   '#eef2f6',
        'text-secondary': '#7a8ba3',
        'text-muted':     '#4a5a72',
        'text-dim':       '#2e3f55',

        // ── GLASS SURFACE ──
        'glass-bg':     'rgba(8,14,28,0.72)',
        'glass-border': 'rgba(255,255,255,0.055)',
        'glass-rim':    'rgba(255,255,255,0.09)',
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1.2' }],
        '3xs': ['0.58rem', { lineHeight: '1.2' }],
      },
      boxShadow: {
        'premium':    '0 24px 64px -16px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.03)',
        'glow-gold':  '0 0 40px -8px rgba(201,151,62,0.20)',
        'glow-cyan':  '0 0 40px -8px rgba(77,208,225,0.15)',
        'glow-jade':  '0 0 40px -8px rgba(45,212,168,0.15)',
        'glow-crimson':'0 0 40px -8px rgba(229,72,77,0.20)',
        'card':       '0 16px 48px -12px rgba(0,0,0,0.80)',
      },
      backgroundImage: {
        'gradient-gold':  'linear-gradient(90deg, #c9973e, #dbb060)',
        'gradient-cyan':  'linear-gradient(90deg, #4dd0e1, #81e8f5)',
        'gradient-jade':  'linear-gradient(90deg, #2dd4a8, #5ee5c5)',
        'gradient-scada': 'linear-gradient(135deg, rgba(201,151,62,0.08), rgba(77,208,225,0.05))',
      },
      animation: {
        'spin-slow':  'spin 12s linear infinite',
        'ping-slow':  'ping 2.4s cubic-bezier(0,0,0.2,1) infinite',
        'fadeIn':     'fadeIn 0.35s ease forwards',
        'fadeInUp':   'fadeInUp 0.4s ease forwards',
        'pulse-gold': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.5rem',
      },
    },
  },
  plugins: [],
}
