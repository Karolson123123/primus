import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        "display-content": {
          from: { opacity: "0" }, 
          to: { opacity: "1" },
        },
        "display-from-top": {
          from: { 
            transform: "translateY(-10%)",
            opacity: "0"
          },
          to: { 
            transform: "translateY(0)",
            opacity: "1"
           },
        },
        "fade-in-right": {
          from: { 
            transform: "translateX(100%)",
            opacity: "0"
          },
          to: { 
            transform: "translateX(0)",
            opacity: "1"
          },
        },
        "fade-out-right": {
          from: { 
            transform: "translateX(0)",
            opacity: "1"
          },
          to: { 
            transform: "translateX(100%)",
            opacity: "0"
          },
        },
        "hide-to-top": {
          from: { 
            transform: "translateY(0)",
            opacity: "1"
          },
          to: { 
            transform: "translateY(-10%)",
            opacity: "0"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "display-content": "display-content 0.2s ease-out",
        "display-from-top": "display-from-top 0.2s ease-out",
        "fade-in-right": "fade-in-right 0.3s ease-out",
        "fade-out-right": "fade-out-right 0.3s ease-in forwards",
        "hide-to-top": "hide-to-top 0.2s ease-in forwards",
      },
    },
  },

} satisfies Config

export default config