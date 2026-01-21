/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: {
          primary: "#0B0D12",
          secondary: "#151821",
        },
        card: {
          DEFAULT: "#1B1F2A",
        },
        accent: {
          DEFAULT: "#C9A24D",
          hover: "#B89140", // Slightly darker for hover states
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#9AA0AE",
        },
        divider: "#2A2F3A",
        status: {
          success: "#2ECC71",
          warning: "#F5A623",
          error: "#E74C3C",
          info: "#4A90E2",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"], // Tabular figures usually work well with mono, or we can use font-feature-settings
      },
    },
  },
  plugins: [],
};
