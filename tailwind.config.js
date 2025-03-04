/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        fontFamily: {
          roboto: ['Roboto', 'Arial', 'sans-serif'],
        },
        colors: {
          'header-admin': '#1A1A1A',
          'sidebar-admin': '#EBEBEB',
          'content-admin': '#F1F1F1',
        },
      },    },
    plugins: [],
  };