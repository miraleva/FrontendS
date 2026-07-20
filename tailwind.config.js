/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // 1. ADIM: Tailwind'e tema geçişini sınıf (class) yöntemiyle yapacağını söylüyoruz
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mevcut renkleriniz (Aydınlık mod varsayılanları)
        primary: '#E36414',
        'primary-dark': '#C2510C',
        secondary: '#0F172A',
        accent: '#14B8A6',
        warning: '#F59E0B',
        danger: '#DC2626',
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',

        // 2. ADIM (OPSİYONEL): İsterseniz dark mod için özel renk isimleri de tanımlayabilirsiniz
        // (Örn: dark modda arka plan rengini 'bg-dark-bg' gibi kullanmak için)
        'dark-bg': '#0B0F19',
        'dark-surface': '#1E293B',
        'dark-border': '#334155'
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