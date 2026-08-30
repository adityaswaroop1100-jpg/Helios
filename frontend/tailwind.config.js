/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- New Base (Kills the blue) ---
        carbon: '#060a14',      // Deepest void
        'carbon-light': '#0b1220',
        
        // --- Premium Metallic Accents ---
        gold: '#c9973e',        // Aged Bullion (replaces #f59e0b)
        'gold-glow': 'rgba(201, 151, 62, 0.25)',
        cyan: '#4dd0e1',        // Tiffany/Cerulean (replaces #38bdf8)
        jade: '#2dd4a8',        // Mint/Teal (replaces #10b981)
        crimson: '#e5484d',     // Apple-style red (replaces #f43f5e)
        
        // --- Text (Cooler, calmer) ---
        'text-primary': '#eef2f6',
        'text-secondary': '#7a8ba3',
        'text-muted': '#4a5a72',
        
        // --- Glass Surface ---
        'glass-bg': 'rgba(6, 10, 20, 0.75)',
        'glass-border': 'rgba(255, 255, 255, 0.04)',
        'glass-rim': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'premium': '0 20px 60px -12px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.02)',
        'glow-gold': '0 0 40px -8px rgba(201,151,62,0.15)',
      },
      animation: {
        'pulse-gold': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
