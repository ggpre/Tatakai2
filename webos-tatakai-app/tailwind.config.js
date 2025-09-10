/** @type {import('tailwindcss').Config} */
export default {
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
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
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
        "tv-focus": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(244, 63, 94, 0.4)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 0 4px rgba(244, 63, 94, 0.6)" },
          "100%": { transform: "scale(1.03)", boxShadow: "0 0 0 2px rgba(244, 63, 94, 0.8)" },
        },
        "tv-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(244, 63, 94, 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "tv-focus": "tv-focus 0.3s ease-out forwards",
        "tv-glow": "tv-glow 2s ease-in-out infinite",
      },
      spacing: {
        'tv-safe': '60px',
        'tv-safe-sm': '40px',
      },
      fontSize: {
        'tv-xs': ['0.875rem', { lineHeight: '1.25rem' }],
        'tv-sm': ['1rem', { lineHeight: '1.5rem' }],
        'tv-base': ['1.125rem', { lineHeight: '1.75rem' }],
        'tv-lg': ['1.25rem', { lineHeight: '1.75rem' }],
        'tv-xl': ['1.5rem', { lineHeight: '2rem' }],
        'tv-2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'tv-3xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'tv-4xl': ['3rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}