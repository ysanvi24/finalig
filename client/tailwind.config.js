/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // शाश्वतम् Purple & Gold Theme
        'ig': {
          'purple': {
            50: 'rgba(45, 27, 105, 0.08)',
            100: 'rgba(45, 27, 105, 0.15)',
            200: '#4a2d8a',
            300: '#3d2479',
            400: '#2d1b69',
            500: '#2d1b69',
            600: '#1e1045',
            700: '#160b30',
            800: '#0e0520',
            900: '#0a0318',
          },
          'gold': {
            50: 'rgba(212, 175, 55, 0.08)',
            100: 'rgba(212, 175, 55, 0.15)',
            200: '#f5e6b8',
            300: '#f0d060',
            400: '#d4af37',
            500: '#d4af37',
            600: '#b8941f',
            700: '#9a7a15',
            800: '#7c610f',
            900: '#5e490a',
          }
        },
        'primary': {
          DEFAULT: '#2d1b69',
          light: '#4a2d8a',
          dark: '#1a0a3e',
        },
        'accent': {
          DEFAULT: '#d4af37',
          hover: '#f0d060',
          light: '#f5e6b8',
          subtle: 'rgba(212, 175, 55, 0.12)',
          dark: '#b8941f',
        },
        'neutral': {
          DEFAULT: '#160b30',
          50: '#f5e6b8',
          100: '#c9b896',
          200: 'rgba(212, 175, 55, 0.2)',
          300: 'rgba(212, 175, 55, 0.4)',
          700: '#1e1045',
          800: '#160b30',
          900: '#0e0520',
        },
      },
      backgroundColor: {
        'app': '#0e0520',
        'card': 'rgba(30, 16, 69, 0.7)',
        'surface': '#160b30',
        'elevated': '#1e1045',
      },
      textColor: {
        'heading': '#f5e6b8',
        'body': '#c9b896',
        'muted': 'rgba(212, 175, 55, 0.5)',
        'gold': '#d4af37',
        'bright': '#ffffff',
      },
      borderColor: {
        'default': 'rgba(212, 175, 55, 0.2)',
        'strong': 'rgba(212, 175, 55, 0.4)',
        'gold': '#d4af37',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #b8941f, #d4af37, #f0d060, #d4af37, #b8941f)',
        'purple-gradient': 'linear-gradient(135deg, #1a0a3e, #2d1b69, #4a2d8a)',
        'purple-radial': 'radial-gradient(ellipse at center, #2d1b69 0%, #0e0520 70%)',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 8px 40px rgba(212, 175, 55, 0.25)',
        'purple': '0 4px 20px rgba(45, 27, 105, 0.3)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        shashwatam: {
          "primary": "#d4af37",
          "secondary": "#2d1b69",
          "accent": "#f0d060",
          "neutral": "#1e1045",
          "base-100": "#0e0520",
          "base-200": "#160b30",
          "base-300": "#1e1045",
          "info": "#60a5fa",
          "success": "#4ade80",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
      },
    ],
    darkTheme: "shashwatam",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}
