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
        tactical: {
          950: '#050810', // Deepest black-blue (map/canvas bg)
          900: '#0B0F19', // Primary app background
          800: '#111827', // Panel surfaces
          700: '#1F2937', // Elevated panel / hover surface
          600: '#374151', // Default borders
          500: '#4B5563', // Subtle borders / muted elements
          400: '#9CA3AF', // Secondary text
          300: '#D1D5DB', // Tertiary text
          200: '#E5E7EB', // Primary text on dark
          100: '#F9FAFB', // Bright text
        },
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

