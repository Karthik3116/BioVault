/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        brand: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          blue: '#3B82F6',
        }
      },
      keyframes: {
        glowing: {
          '0%, 100%': { opacity: '0.7', boxShadow: '0 0 3px #EC4899' },
          '50%': { opacity: '1', boxShadow: '0 0 10px #EC4899, 0 0 15px #EC4899' },
        },
        scan: {
          '0%': { top: '0%', bottom: '100%' },
          '50%': { top: '0%', bottom: '0%' },
          '100%': { top: '100%', bottom: '0%' },
        }
      },
      animation: {
        glowing: 'glowing 2.5s ease-in-out infinite',
        scan: 'scan 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}