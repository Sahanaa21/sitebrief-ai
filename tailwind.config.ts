import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b1220",
          900: "#111827",
          800: "#1f2937",
          700: "#374151",
          600: "#4b5563",
          500: "#6b7280",
          400: "#9ca3af",
          300: "#d1d5db",
          200: "#e5e7eb",
          100: "#f3f4f6",
          50: "#f9fafb",
        },
        brand: {
          950: "#0a2540",
          900: "#0f3a5f",
          800: "#134e7c",
          700: "#1a6299",
          600: "#2277b3",
          500: "#2f8fce",
          400: "#5fabdd",
          300: "#93c7e9",
          200: "#c3e0f2",
          100: "#e4f1fa",
          50: "#f2f9fd",
        },
        clay: {
          600: "#b45309",
          500: "#d97706",
          100: "#fef3c7",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)",
        panel: "0 4px 16px -4px rgba(15, 23, 42, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
