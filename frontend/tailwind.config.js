export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          dark: "#0F172A",
          glass: "rgba(30, 41, 59, 0.7)",
          accent: "#38BDF8",
          warning: "#F59E0B",
          danger: "#EF4444",
          success: "#10B981"
        }
      }
    },
  },
  plugins: [],
}
