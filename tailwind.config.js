// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primarylight: '#BABA9E',
        primary: '#43573C',
        surface: '#E8ECF3',
        blackdark: '#2E3139'
      },
      spacing: {
        
      },
      padding: {
        '100px': '100px',
        '30px': '30px',
        '38px': '38px'
      },
      borderRadius: {
        '20px': '20px',
        '10px': '10px'
      }
    },
  },
  plugins: [],
}
