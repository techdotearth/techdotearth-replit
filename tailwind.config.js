export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "te-primary": "#125C5C",
        "te-ink": {
          900: "#0B1221",
          700: "#1F2937",
        },
        "te-surface": "#FFFFFF",
        "te-muted": "#F3F4F6",
        "te-border": "#E5E7EB",
        "te-aq": "#4C51BF",
        "te-heat": "#E25822",
        "te-flood": "#0E7490",
        "te-fire": "#B91C1C",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "xl": "10px",
      },
    },
  },
  plugins: [],
}