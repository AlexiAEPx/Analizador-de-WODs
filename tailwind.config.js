/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          0: '#08080c',
          1: '#0e0e14',
          2: '#14141c',
          3: '#1a1a24',
        },
        glass: {
          border: 'rgba(255,255,255,0.06)',
          bg: 'rgba(255,255,255,0.03)',
          hover: 'rgba(255,255,255,0.06)',
        },
        sem: {
          rojo: '#ff5c5c',
          naranja: '#ff9f43',
          amarillo: '#feca57',
          verde: '#5cd85c',
        },
        accent: '#ff5c5c',
      },
    },
  },
  plugins: [],
};
