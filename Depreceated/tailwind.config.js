/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // TV-optimized spacing for 10-foot UI
      spacing: {
        'tv-xs': '0.25rem',    // 4px
        'tv-sm': '0.5rem',     // 8px
        'tv-md': '1rem',       // 16px
        'tv-lg': '1.5rem',     // 24px
        'tv-xl': '2rem',       // 32px
        'tv-2xl': '3rem',      // 48px
        'tv-3xl': '4rem',      // 64px
      },
      // TV-readable font sizes (minimum 24px for 10-foot viewing)
      fontSize: {
        'tv-xs': ['1rem', { lineHeight: '1.25rem' }],      // 16px (for small UI)
        'tv-sm': ['1.125rem', { lineHeight: '1.5rem' }],   // 18px
        'tv-base': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        'tv-lg': ['1.5rem', { lineHeight: '2rem' }],       // 24px (minimum readable)
        'tv-xl': ['1.75rem', { lineHeight: '2.25rem' }],   // 28px
        'tv-2xl': ['2rem', { lineHeight: '2.5rem' }],      // 32px
        'tv-3xl': ['2.5rem', { lineHeight: '3rem' }],      // 40px
        'tv-4xl': ['3rem', { lineHeight: '3.5rem' }],      // 48px
        'tv-5xl': ['4rem', { lineHeight: '4.5rem' }],      // 64px
        'tv-6xl': ['5rem', { lineHeight: '5.5rem' }],      // 80px
      },
      // TV-optimized colors with high contrast
      colors: {
        // Custom TV-friendly color palette
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
        // TV-specific focus colors
        'tv-focus': {
          DEFAULT: '#3b82f6',      // Bright blue for focus
          ring: '#60a5fa',         // Lighter blue for focus ring
          glow: '#1d4ed8',         // Darker blue for glow effect
        },
        // Anime theme colors
        'anime': {
          primary: '#e11d48',      // Rose red
          secondary: '#7c3aed',    // Purple
          accent: '#f59e0b',       // Amber
          success: '#10b981',      // Emerald
        }
      },
      // TV-optimized border radius
      borderRadius: {
        'tv-sm': '0.25rem',    // 4px
        'tv-md': '0.5rem',     // 8px
        'tv-lg': '0.75rem',    // 12px
        'tv-xl': '1rem',       // 16px
        'tv-2xl': '1.5rem',    // 24px
      },
      // TV-optimized animations
      animation: {
        'tv-focus': 'tv-focus 0.3s ease-in-out',
        'tv-glow': 'tv-glow 2s ease-in-out infinite alternate',
        'tv-slide-in': 'tv-slide-in 0.5s ease-out',
        'tv-fade-in': 'tv-fade-in 0.3s ease-in',
      },
      keyframes: {
        'tv-focus': {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
          '100%': { transform: 'scale(1.02)', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)' }
        },
        'tv-glow': {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }
        },
        'tv-slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'tv-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      // TV-safe zones (5% margin from edges)
      inset: {
        'tv-safe': '5%',
        'tv-safe-x': '5%',
        'tv-safe-y': '5%',
      },
      // TV-optimized box shadows
      boxShadow: {
        'tv-focus': '0 0 0 3px rgba(59, 130, 246, 0.5)',
        'tv-glow': '0 0 20px rgba(59, 130, 246, 0.4)',
        'tv-card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      // TV screen breakpoints
      screens: {
        'tv-sm': '1280px',    // Small TV
        'tv-md': '1920px',    // Standard HD TV
        'tv-lg': '2560px',    // QHD TV
        'tv-xl': '3840px',    // 4K TV
      }
    },
  },
  plugins: [],
}
