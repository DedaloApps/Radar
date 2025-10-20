/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saude: '#e74c3c',
        ambiente: '#27ae60',
        economia: '#3498db',
        trabalho: '#f39c12',
        financas: '#9b59b6',
      }
    },
  },
  plugins: [],
}