module.exports = {
  darkMode: ["class"], // still needed for toggle
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(142.1 76.2% 36.3%)",   // emerald
          foreground: "hsl(144.9 80.4% 10%)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
