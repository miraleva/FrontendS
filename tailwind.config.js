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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif']
      },
      borderRadius: { card: '12px', btn: '8px' }
    }
  },
  plugins: []
};
