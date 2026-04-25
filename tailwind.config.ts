import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1360px" }
    },
    extend: {
      colors: {
        // Light-theme semantic tokens (driven by CSS variables in globals.css).
        bg: {
          app: "hsl(var(--bg-app))",
          surface: "hsl(var(--bg-surface))",
          sidebar: "hsl(var(--bg-sidebar))",
          muted: "hsl(var(--bg-muted))"
        },
        fg: {
          DEFAULT: "hsl(var(--fg))",
          muted: "hsl(var(--fg-muted))",
          soft: "hsl(var(--fg-soft))"
        },
        line: "hsl(var(--line))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          soft: "hsl(var(--brand-soft))",
          hover: "hsl(var(--brand-hover))"
        },
        accent: {
          indigo: "hsl(var(--accent-indigo))",
          green: "hsl(var(--accent-green))",
          amber: "hsl(var(--accent-amber))",
          rose: "hsl(var(--accent-rose))",
          sky: "hsl(var(--accent-sky))",
          violet: "hsl(var(--accent-violet))"
        },
        // Legacy ocean palette — still referenced by public landing page.
        ocean: {
          deep: "#031829",
          mid: "#073b59",
          light: "#108cc5",
          accent: "#72d9ff"
        }
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "Space Grotesk",
          "Segoe UI",
          "system-ui",
          "sans-serif"
        ]
      },
      borderRadius: {
        xl: "20px",
        lg: "14px",
        md: "10px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        "card-lg": "0 4px 24px rgba(16, 24, 40, 0.06)",
        sidebar: "0 0 0 1px rgba(16, 24, 40, 0.04)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
