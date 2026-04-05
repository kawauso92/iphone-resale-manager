import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgSecondary: "var(--bg-secondary)",
        bgTertiary: "var(--bg-tertiary)",
        accent: "var(--accent)",
        accentHover: "var(--accent-hover)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        border: "var(--border)",
        success: "var(--success)",
        danger: "var(--danger)",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(12, 18, 34, 0.24)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
