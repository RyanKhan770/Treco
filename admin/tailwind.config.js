/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        primaryLight: '#40916C',
        primaryPale: '#D8F3DC',
        accent: '#52B788',
      },
    },
  },
  plugins: [],
};

