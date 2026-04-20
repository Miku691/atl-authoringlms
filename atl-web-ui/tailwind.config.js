/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EduFlow Design System — from DESIGN.md / Stitch Project 15155094690541932935
        primary: {
          DEFAULT: '#2A6DF4', // Institutional Blue
          hover:   '#1A5CE0',
          light:   '#EBF1FE',
          dark:    '#1A3D8A',
        },
        surface:  '#FFFFFF',
        background: '#F7F9FF',
        border:   '#E2E8F8',
        text: {
          primary:   '#0F1D3A',
          secondary: '#5A6B88',
          muted:     '#8FA3C0',
        },
        success: '#16A34A',
        error:   '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:   '12px',
        pill:   '9999px',
        modal:  '16px',
        badge:  '9999px',
        input:  '10px',
        button: '10px',
        icon:   '12px',
      },
      boxShadow: {
        sm:    '0 1px 3px rgba(0,0,0,0.06)',
        md:    '0 2px 8px rgba(0,0,0,0.08)',
        lg:    '0 8px 24px rgba(42,109,244,0.10)',
        xl:    '0 16px 48px rgba(42,109,244,0.18)',
        brand: '0 4px 16px rgba(42,109,244,0.35)',
        card:  '0 2px 8px rgba(0,0,0,0.04)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-mid':  'float 7s ease-in-out infinite 1s',
        'float-fast': 'float 5s ease-in-out infinite 0.5s',
        'pulse-dot':  'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-up':    'fadeUp 0.4s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
}
