/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EduFlow Design System
        primary: {
          DEFAULT: 'var(--brand, #2A6DF4)', 
          hover:   'var(--brand-hover, #1A5CE0)',
          light:   'var(--brand-subtle, #EBF1FE)',
          dark:    'var(--brand-shadow, #1A3D8A)',
        },
        surface:  'var(--bg-surface)',
        chrome:   'var(--bg-chrome)',
        background: 'var(--bg-main)',
        border:   'var(--border)',
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
        content: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
        success: '#16A34A',
        error:   '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // ─── IMS UI Font Size Scale ───────────────────────────────────────
        // Usage: text-ui-xs, text-ui-sm, text-ui-md, etc.
        // Intentionally compact — slightly smaller than Tailwind defaults.
        'ui-xs':   ['10px', { lineHeight: '1.4' }],  // role chips, tiny badges
        'ui-sm':   ['11px', { lineHeight: '1.4' }],  // breadcrumbs, uppercase labels
        'ui-base': ['12px', { lineHeight: '1.5' }],  // table secondary, metadata
        'ui-md':   ['13px', { lineHeight: '1.5' }],  // body text, form labels, dropdowns
        'ui-body': ['14px', { lineHeight: '1.6' }],  // default paragraph, modal messages
        'ui-lg':   ['15px', { lineHeight: '1.5' }],  // button labels, card subtitles
        'ui-xl':   ['16px', { lineHeight: '1.5' }],  // section subtitles, nav items
        'ui-2xl':  ['18px', { lineHeight: '1.35' }], // modal titles, card headings
        'ui-3xl':  ['20px', { lineHeight: '1.3' }],  // page section headings
        'ui-4xl':  ['24px', { lineHeight: '1.25' }], // page main titles
        'ui-5xl':  ['30px', { lineHeight: '1.2' }],  // hero stats / dashboard numbers
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
