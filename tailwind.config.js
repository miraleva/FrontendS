/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0B5FFF',
        'primary-dark': '#0A3FBF',
        secondary: '#0F172A',
        accent: '#14B8A6',
        warning: '#F59E0B',
        danger: '#DC2626',
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Poppins', 'system-ui', 'sans-serif']
      },
      borderRadius: { card: '12px', btn: '8px' },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
