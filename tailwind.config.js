/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#3b82f6',
          secondary: '#f59e0b',
          accent: '#37cdbe',
          neutral: '#3d4451',
          'base-100': '#ffffff',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#3b82f6',
          secondary: '#f59e0b',
          accent: '#37cdbe',
          neutral: '#2a2e37',
          'base-100': '#1f2937',
        },
      },
    ],
  },
};
