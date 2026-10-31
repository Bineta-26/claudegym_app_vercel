/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        lime: { 400: '#c6ff3d', 500: '#b4f02a', 600: '#8fc414' },
        cyan: { 400: '#22e4ff', 500: '#00c8f0' },
        ink: { 950: '#05070b', 900: '#0a0e15', 800: '#111722', 700: '#1a2230' },
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(198,255,61,0.55)',
        'glow-cyan': '0 0 40px -8px rgba(34,228,255,0.5)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseline: { '0%': { strokeDashoffset: 100 }, '45%,100%': { strokeDashoffset: 0 } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseline: 'pulseline 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
