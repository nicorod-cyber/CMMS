/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--color-rojo-tronadura) / <alpha-value>)",
          foreground: "hsl(var(--color-blanco-puro) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-azul-petroleo) / <alpha-value>)",
          foreground: "hsl(var(--color-blanco-puro) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-rojo-tronadura) / <alpha-value>)",
          foreground: "hsl(var(--color-blanco-puro) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--color-gris-corporativo) / <alpha-value>)",
          foreground: "hsl(var(--color-acero-claro) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--color-indigo-tecnico) / <alpha-value>)",
          foreground: "hsl(var(--color-blanco-puro) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        noche: "hsl(var(--color-noche-minera) / <alpha-value>)",
        "gris-corporativo": "hsl(var(--color-gris-corporativo) / <alpha-value>)",
        "acero-claro": "hsl(var(--color-acero-claro) / <alpha-value>)",
        "blanco-puro": "hsl(var(--color-blanco-puro) / <alpha-value>)",
        "rojo-tronadura": "hsl(var(--color-rojo-tronadura) / <alpha-value>)",
        "azul-petroleo": "hsl(var(--color-azul-petroleo) / <alpha-value>)",
        "verde-seguridad": "hsl(var(--color-verde-seguridad) / <alpha-value>)",
        "ambar-faena": "hsl(var(--color-ambar-faena) / <alpha-value>)",
        "indigo-tecnico": "hsl(var(--color-indigo-tecnico) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Montserrat', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}