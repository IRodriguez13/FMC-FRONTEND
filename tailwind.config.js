/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f0',
          100: '#f5e6cc',
          200: '#e8c99a',
          300: '#d4a96a',
          400: '#c08b40',
          500: '#a06e28',
          600: '#7d5420',
          700: '#5a3c18',
          800: '#3d2810',
          900: '#1e1408',
        },
        cream: {
          50: '#fefcf8',
          100: '#faf3e0',
          200: '#f0ddb8',
          300: '#e3c48a',
          400: '#d4a85a',
          500: '#c08c30',
        },
        sand: {
          100: '#f5ede0',
          200: '#ecdcc8',
          300: '#dfc9a8',
          400: '#c9a97a',
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'body': ['"Lato"', 'sans-serif'],
        'mono': ['"Courier Prime"', 'monospace'],
      },
      backgroundImage: {
        'coffee-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c08b40' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'coffee': '0 4px 20px rgba(160, 110, 40, 0.15)',
        'coffee-lg': '0 8px 40px rgba(160, 110, 40, 0.2)',
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
