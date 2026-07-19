/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Each shade is backed by a CSS variable (set in index.css for :root/light and .dark)
        // so every existing `bg-tactical-*` / `text-tactical-*` / `border-tactical-*` utility
        // (including opacity modifiers like `bg-tactical-800/60`) automatically re-themes —
        // no component changes needed to support light/dark mode.
        tactical: {
          950: 'rgb(var(--tactical-950) / <alpha-value>)', // Deepest bg (map/canvas) in dark; lightest in light
          900: 'rgb(var(--tactical-900) / <alpha-value>)', // Primary app background
          800: 'rgb(var(--tactical-800) / <alpha-value>)', // Panel surfaces
          700: 'rgb(var(--tactical-700) / <alpha-value>)', // Elevated panel / hover surface
          600: 'rgb(var(--tactical-600) / <alpha-value>)', // Default borders
          500: 'rgb(var(--tactical-500) / <alpha-value>)', // Subtle borders / muted elements
          400: 'rgb(var(--tactical-400) / <alpha-value>)', // Secondary text
          300: 'rgb(var(--tactical-300) / <alpha-value>)', // Tertiary text
          200: 'rgb(var(--tactical-200) / <alpha-value>)', // Primary text
          100: 'rgb(var(--tactical-100) / <alpha-value>)', // Brightest text
        },
        white: 'rgb(var(--tactical-100) / <alpha-value>)', // re-themed: acts as "brightest foreground" in both modes
        accent: {
          blue:  '#3B82F6', // Primary action
          cyan:  '#06B6D4', // Highlights / active
          red:   '#EF4444', // Danger / CRITICAL
          amber: '#F59E0B', // Warning / HIGH
          green: '#10B981', // Success / secure
          purple:'#8B5CF6', // Network / relationships
          orange:'#F97316', // Secondary alert
        },
      },
      fontFamily: {
        sans: ['Fira Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        'panel': '320px',
        'sidebar': '56px',
      },
      backdropBlur: {
        'xs': '4px',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fade-in 0.18s ease-out both',
        'slide-right': 'slide-in-right 0.22s ease-out both',
        'slide-left':  'slide-in-left 0.22s ease-out both',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(6, 182, 212, 0.35)',
        'glow-red':    '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-amber':  '0 0 20px rgba(245, 158, 11, 0.35)',
        'glow-green':  '0 0 20px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [],
}

