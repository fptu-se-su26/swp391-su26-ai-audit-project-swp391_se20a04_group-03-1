import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        primary: {
          navy: "#1a3a52",
          darkblue: "#0f1f3a",
          cyan: "#00D4FF",
          orange: "#FF6B35",
          lime: "#00FF00",
        },
        // Light mode colors
        secondary: {
          lightgray: "#f5f5f5",
          cream: "#f0f0f0",
          lightgreen: "#4CAF50",
          orange: "#FF6B35",
        },
      },
    },
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1200px',
    },
  },
  plugins: [],
} satisfies Config;
