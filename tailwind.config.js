/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        // Admin panel colors
        'header-admin': '#1A1A1A',
        'sidebar-admin': '#E8F0FE',  // Light blue
        'content-admin': '#F0F6FF',  // Lighter blue
        
        // System-wide background colors - blue theme
        'bg-primary': '#F0F6FF',     // Light blue background
        'bg-secondary': '#E1EBFA',   // Slightly darker blue background
        'bg-accent': '#D6E4FF',      // Accent blue background
        'bg-card': '#FFFFFF',        // White for card backgrounds
        
        // Override gray scale for consistency with blue theme
        gray: {
          50: '#F8FAFF',
          100: '#F0F6FF',
          200: '#E1EBFA',
          300: '#D6E4FF',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
    },
  },
  plugins: [],
};