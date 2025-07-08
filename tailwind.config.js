/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/stories/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primarylight: '#BABA9E',
        primary: '#43573C',
        primarygray: '#6B6B6B',
        surface: '#E8ECF3',
        blackdark: '#2E3139',
        Gray: '#F6F5F4'
      },
      spacing: {

      },
      padding: {
        '100px': '100px',
        '30px': '30px',
        '38px': '38px',
        '60px': '60px',
        '5px': '5px'
      },
      margin: {
        '100px': '100px',
        '60px': '60px',
        '30px': '30px'
      },
      borderRadius: {
        '20px': '20px',
        '10px': '10px'
      },
      fontSize: {
        '64px': '64px'
      },
      lineHeight: {
        '18px': '18px'
      },
      fontFamily: {
        Nunito: ['Nunito']
      },
      width: {
        '85%': '85%',
        '30%': '30%',
        '55px': '55px'
      },
      height: {
        '55px': '55px'
      }
    },
  },
  plugins: [],
}