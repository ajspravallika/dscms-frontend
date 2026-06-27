/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2128',
        paper: '#FAFAF8',
        surface: '#FFFFFF',
        line: '#E4E1DA',
        muted: '#6B7280',
        accent: {
          DEFAULT: '#2D5C4D',
          soft: '#E8F0EC',
          dark: '#1F4338',
        },
        warn: {
          DEFAULT: '#B8542C',
          soft: '#F7E9E1',
        },
        mentor: {
          DEFAULT: '#3B5A82',
          soft: '#E8EEF6',
        },
        student: {
          DEFAULT: '#7A5C3E',
          soft: '#F2ECE3',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(28,33,40,0.04), 0 1px 8px -2px rgba(28,33,40,0.06)',
      },
    },
  },
  plugins: [],
};
