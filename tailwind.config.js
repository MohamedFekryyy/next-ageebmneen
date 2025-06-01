/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: [
          'IBM Plex Sans Arabic',
          'IBM Plex Sans',
          'Kanit',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

