/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
        },
        success: {
          DEFAULT: '#22c55e',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
        sidebar: {
          DEFAULT: '#161b22',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
