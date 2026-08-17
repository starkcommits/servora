/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UC Exact Palette
        uc: {
          black: '#1C1C1C',
          gray: {
            50:  '#FAFAFA',
            100: '#F5F5F5',
            200: '#E8E8E8',
            300: '#D1D1D1',
            400: '#A0A0A0',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            900: '#1C1C1C',
          },
          // Brand accent — used ONLY on logo mark, primary CTA, minimal highlights
          accent: '#7C3AED',
        },
        // shadcn CSS variable bridge
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: { DEFAULT: 'var(--destructive)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        // UC-style: extremely subtle shadows, almost invisible
        'uc-sm':    '0 1px 3px 0 rgba(0,0,0,0.06)',
        'uc-md':    '0 4px 12px 0 rgba(0,0,0,0.08)',
        'uc-lg':    '0 8px 24px 0 rgba(0,0,0,0.1)',
        'uc-sticky':'0 2px 8px 0 rgba(0,0,0,0.08)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { from: { transform: 'scale(0.97)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
