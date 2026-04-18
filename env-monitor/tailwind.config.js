/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        skeleton: "var(--skeleton)",
        border: "var(--btn-border)",
        input: "var(--input)",
        
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#1b6ca8',
          800: '#0f4c75',
          900: '#0c4a6e',
          950: '#082f49',
        },
        danger: {
          DEFAULT: '#e74c3c',
          dark: '#c0392b',
        },
        warning: {
          DEFAULT: '#f39c12',
          dark: '#e67e22',
        },
        safe: {
          DEFAULT: '#2ecc71',
          dark: '#27ae60',
        },
        dark: {
          base: '#0a0e1a',
          surface: '#111827',
        }
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      boxShadow: {
        input: [
          "0px 2px 3px -1px rgba(0, 0, 0, 0.1)",
          "0px 1px 0px 0px rgba(25, 28, 33, 0.02)",
          "0px 0px 0px 1px rgba(25, 28, 33, 0.08)",
        ].join(", "),
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'ripple': 'ripple 2s ease calc(var(--i, 0) * 0.2s) infinite',
        'orbit': 'orbit calc(var(--duration) * 1s) linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        ripple: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(0.9)" },
        },
        orbit: {
          "0%": {
            transform: "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        }
      }
    },
  },
  plugins: [],
}
