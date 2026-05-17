/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#050914',
        panel: 'rgba(12, 24, 44, 0.72)',
        cyanline: '#30d5ff',
        alert: '#ff4d6d'
      },
      boxShadow: {
        glow: '0 0 28px rgba(48, 213, 255, 0.24)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};

