/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dnd-red': '#8B0000',
        'dnd-gold': '#FFD700',
        'dnd-parchment': '#F5E6D3',
        'dnd-dark': '#2D1B14',
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
