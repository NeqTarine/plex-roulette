/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      fontFamily: {
            // 👇 Add CSS variables
        poppins: ["var(--font-poppins)"],
        poppins400: ["var(--font-poppins500)"],
          },

      },
      screens: {
        'xs': '350px',
        // => @media (min-width: 640px) { ... }
    },
  },
  },
  plugins: [],
};
