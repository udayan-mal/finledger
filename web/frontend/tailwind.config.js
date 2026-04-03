/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "on-background": "#e3e0f4",
        "surface": "#12121f",
        "on-tertiary": "#3d2e00",
        "on-secondary": "#2b2e4a",
        "on-error-container": "#ffdad6",
        "surface-container-lowest": "#0d0d1a",
        "on-tertiary-fixed": "#241a00",
        "inverse-surface": "#e3e0f4",
        "inverse-on-surface": "#2f2f3d",
        "primary-fixed-dim": "#c7c4d7",
        "secondary": "#c2c4e7",
        "on-tertiary-container": "#503d00",
        "on-primary-container": "#3f3e4d",
        "error-container": "#93000a",
        "tertiary-fixed": "#ffe08f",
        "surface-variant": "#343342",
        "tertiary-container": "#c9a84c",
        "primary": "#c7c5d8",
        "on-surface-variant": "#d0c5b2",
        "inverse-primary": "#5e5d6d",
        "error": "#ffb4ab",
        "surface-container-high": "#292937",
        "on-secondary-container": "#b4b6d9",
        "tertiary-fixed-dim": "#e6c364",
        "surface-dim": "#12121f",
        "on-secondary-fixed-variant": "#424562",
        "tertiary": "#e6c364",
        "on-primary-fixed-variant": "#464555",
        "primary-container": "#acaabc",
        "outline-variant": "#4d4637",
        "surface-bright": "#383847",
        "secondary-fixed-dim": "#c2c4e7",
        "on-primary-fixed": "#1a1a28",
        "on-primary": "#2f2f3d",
        "surface-container-highest": "#343342",
        "primary-fixed": "#e3e0f4",
        "surface-tint": "#c7c4d7",
        "surface-container-low": "#1a1a28",
        "surface-container": "#1e1e2c",
        "on-tertiary-fixed-variant": "#584400",
        "secondary-container": "#444764",
        "background": "#12121f",
        "on-surface": "#e3e0f4",
        "on-secondary-fixed": "#161934",
        "secondary-fixed": "#dfe0ff",
        "outline": "#99907e",
        "on-error": "#690005",
        "success": "#22C55E",
        "danger": "#EF4444",
        "warning": "#F59E0B"
      },
      fontFamily: {
        headline: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"],
        label: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        panel: "0 22px 50px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(201,168,76,0.22), 0 10px 35px rgba(201,168,76,0.08)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        floatIn: "floatIn 500ms ease-out"
      }
    }
  },
  plugins: []
};
