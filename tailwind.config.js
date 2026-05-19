/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic theme tokens — map to CSS variables in index.css
        theme: {
          bg:       'var(--bg)',
          surface:  'var(--surface)',
          card:     'var(--card)',
          elevated: 'var(--elevated)',
          bdr:      'var(--bdr)',
          bdr2:     'var(--bdr2)',
          input:    'var(--input)',
          text:     'var(--text)',
          text2:    'var(--text2)',
          muted:    'var(--muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
