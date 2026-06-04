/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './src/**/*.{html,js,css}'],
  theme: {
    extend: {
      colors: {
        'exam-green': { 900:'#0d2818', 800:'#1a472a', 700:'#1e5c35', 600:'#2d7a47' },
        'exam-gold':  { DEFAULT:'#d4af37', light:'#f4d03f', dark:'#b8960c' },
      },
      fontFamily: {
        display: ['"Playfair Display"','Georgia','serif'],
        body:    ['"Inter"','system-ui','sans-serif'],
      },
    }
  },
  plugins: [],
}
