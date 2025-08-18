/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark red and black theme
        primary: {
          50: '#fdf2f2',
          100: '#fce8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#f56565',
          600: '#e53e3e',
          700: '#c53030',
          800: '#9b2c2c',
          900: '#742a2a',
          950: '#4a1414',
        },
        dark: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#313131',
          950: '#0a0a0a',
        },
        accent: {
          red: '#dc2626',
          gold: '#f59e0b',
          green: '#059669',
          blue: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'dark': '0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'red': '0 10px 25px -3px rgba(220, 38, 38, 0.3), 0 4px 6px -2px rgba(220, 38, 38, 0.2)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #313131 100%)',
        'gradient-red': 'linear-gradient(135deg, #4a1414 0%, #9b2c2c 100%)',
        'gradient-primary': 'linear-gradient(135deg, #742a2a 0%, #c53030 100%)',
      }
    },
  },
  plugins: [],
}