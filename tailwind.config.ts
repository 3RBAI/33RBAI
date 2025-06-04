import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // تحسين الألوان للواجهة
        red: {
          "50": "#fff1f1",
          "100": "#ffe1e1",
          "200": "#ffc7c7",
          "300": "#ffa0a0",
          "400": "#ff6b6b",
          "500": "#ff3a3a",
          "600": "#ff1f1f",
          "700": "#e50000",
          "800": "#c50000",
          "900": "#9f0000",
          "950": "#600000",
        },
        blue: {
          "50": "#edfaff",
          "100": "#d6f2ff",
          "200": "#b5e9ff",
          "300": "#83ddff",
          "400": "#48c7ff",
          "500": "#1eaaff",
          "600": "#0089ff",
          "700": "#006edb",
          "800": "#005db2",
          "900": "#064f8d",
          "950": "#03305d",
        },
        green: {
          "50": "#edfff4",
          "100": "#d7ffe7",
          "200": "#b2ffd0",
          "300": "#7bfcb0",
          "400": "#3df285",
          "500": "#13e05e",
          "600": "#00c048",
          "700": "#00963c",
          "800": "#007535",
          "900": "#005f2f",
          "950": "#00351b",
        },
        purple: {
          "50": "#faf5ff",
          "100": "#f3e7ff",
          "200": "#e9d4ff",
          "300": "#d8b4fe",
          "400": "#c084fc",
          "500": "#a855f7",
          "600": "#9333ea",
          "700": "#7e22ce",
          "800": "#6b21a8",
          "900": "#581c87",
          "950": "#3b0764",
        },
        orange: {
          "50": "#fff8ed",
          "100": "#ffefd4",
          "200": "#ffdba8",
          "300": "#ffc170",
          "400": "#ff9a36",
          "500": "#ff7b0d",
          "600": "#ff6000",
          "700": "#cc4600",
          "800": "#a13800",
          "900": "#832f00",
          "950": "#461600",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
