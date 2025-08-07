/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'game-bg': '#87CEEB',
        'game-primary': '#2E8B57',
        'game-secondary': '#34495E',
        'game-accent': '#FFD700',
        'game-danger': '#E74C3C',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '16/10': '16 / 10',
        '3/4': '3 / 4',
      },
      screens: {
        'xs': '475px',
        'tall': { 'raw': '(min-height: 800px)' },
        'short': { 'raw': '(max-height: 600px)' },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-lg': {
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
        },
        '.pixel-perfect': {
          imageRendering: '-moz-crisp-edges',
          imageRendering: '-webkit-crisp-edges',
          imageRendering: 'pixelated',
          imageRendering: 'crisp-edges',
        },
        '.no-select': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
        },
        '.game-focus': {
          outline: '2px solid #3B82F6',
          outlineOffset: '2px',
        }
      }
      addUtilities(newUtilities)
    }
  ],
  // Enable dark mode support
  darkMode: 'media',
  
  // Safelist important classes that might be used dynamically
  safelist: [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
    'text-red-500',
    'text-green-500',
    'text-blue-500',
    'border-red-500',
    'border-green-500',
    'border-blue-500',
    'animate-spin',
    'animate-bounce',
    'animate-pulse',
    'opacity-0',
    'opacity-50',
    'opacity-100',
    'scale-0',
    'scale-50',
    'scale-100',
    'scale-110',
    'scale-125',
    'rotate-0',
    'rotate-45',
    'rotate-90',
    'rotate-180',
    'translate-x-0',
    'translate-y-0',
    '-translate-x-full',
    '-translate-y-full',
    'transform',
    'transition-all',
    'duration-200',
    'duration-300',
    'duration-500',
    'ease-in-out',
    'ease-out',
    'ease-in',
  ]
}