/** Tailwind build config — mirrors the inline config previously loaded from the Play CDN */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
      },
    },
  },
  plugins: [],
};
