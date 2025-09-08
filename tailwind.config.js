/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#F3F4F6', // Light Gray
        'surface': '#FFFFFF',    // White
        'primary': '#3B82F6',
        'primary-focus': '#2563EB',
        'secondary': '#8B5CF6',
        'accent': '#F59E0B',
        'text-primary': '#111827', // Dark Gray / Black
        'text-secondary': '#4B5563', // Medium Gray
        'border': '#D1D5DB', // Border color
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}