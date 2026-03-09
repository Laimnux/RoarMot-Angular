/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Esto nos permite activar el modo oscuro manualmente
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'roar-dark': '#0D1118',     // Fondo profundo del login
        'roar-card': '#161B22',     // Fondo de tarjetas/inputs
        'roar-accent': '#5C7589',   // Gris azulado técnico
        'roar-gold': '#FBBF24',     // Dorado de acentos
        'roar-red': '#8B0000',      // Rojo del botón "INGRESAR"
        'dark-bg': '#111521',       // Colores del dashboard original
        'dark-form': '#141824',
        'dark-content': '#1a1e2f',
      },
      fontFamily: {
        'oswald': ['Oswald', 'sans-serif'], // Tipografía principal RoarMot
      },
      letterSpacing: {
        'ultra-wide': '.25em', // Para el estilo "INICIA SESIÓN EN EL SISTEMA"
      }
    },
  },
  plugins: [],
}