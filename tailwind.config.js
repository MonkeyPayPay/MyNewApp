/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Two-level elevation for the dark theme — replaces three
        // different near-black hex values that had drifted in with no
        // rule (see docs/DESIGN_AUDIT.md). ink-950 is the page/app
        // background; ink-900 is one step up, for a shell or panel that
        // should read as sitting above the page.
        ink: {
          950: '#050510',
          900: '#0a0a1a',
        },
      },
      boxShadow: {
        // Resting elevation — cards, list rows.
        'elevation-1': '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
        // Raised elevation — modals, dropdowns, anything overlaying content.
        'elevation-2': '0 8px 24px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
      },
    },
  },
  plugins: [],
}

