import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060f1c",
          900: "#08162A",
          850: "#0B1F3A",
          800: "#0F284B",
          700: "#163866",
          600: "#1F4D8B",
        },
        corporate: {
          50: "#eff4ff",
          100: "#dbe6fe",
          200: "#bfd3fe",
          500: "#2970ff",
          600: "#155EEF",
          700: "#0040c1",
        },
        electric: {
          400: "#38bdf8",
          500: "#00A3FF",
          600: "#0084cc",
        },
        brand: {
          bg: "#F5F7FB",
          card: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",
          success: "#12B76A",
          warning: "#F79009",
          danger: "#F04438",
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'card-hover': '0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'glass': '0 8px 32px 0 rgba(11, 31, 58, 0.15)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'navy-gradient': 'linear-gradient(135deg, #08162A 0%, #0B1F3A 50%, #155EEF 100%)',
        'blue-gradient': 'linear-gradient(135deg, #155EEF 0%, #00A3FF 100%)',
        'success-gradient': 'linear-gradient(135deg, #12B76A 0%, #059669 100%)',
        'danger-gradient': 'linear-gradient(135deg, #F04438 0%, #DC2626 100%)',
      },
    },
  },
  plugins: [],
};
export default config;

