/** @type {import('tailwindcss').Config} */
export const content = [
  './app/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}'
];
export const theme = {
  extend: {
    fontFamily: {
      poppins: ['var(--font-poppins)'],
      geist: ['var(--font-geist-sans)'],
      mono: ['var(--font-geist-mono)'],
    },
  },
};
export const plugins = [];
