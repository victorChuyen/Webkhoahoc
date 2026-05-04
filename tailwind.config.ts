import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: { "2xl": "1400px" },
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
                // Brand colors
                brand: {
                    50: "hsl(220, 100%, 97%)",
                    100: "hsl(220, 95%, 93%)",
                    200: "hsl(220, 90%, 85%)",
                    300: "hsl(220, 85%, 75%)",
                    400: "hsl(220, 80%, 63%)",
                    500: "hsl(220, 75%, 52%)",
                    600: "hsl(220, 75%, 42%)",
                    700: "hsl(220, 75%, 33%)",
                    800: "hsl(220, 75%, 25%)",
                    900: "hsl(220, 75%, 17%)",
                },
                gold: {
                    400: "hsl(43, 96%, 56%)",
                    500: "hsl(38, 92%, 50%)",
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
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(10px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "slide-in": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
                shimmer: {
                    from: { backgroundPosition: "-200px 0" },
                    to: { backgroundPosition: "calc(200px + 100%) 0" },
                },
                "count-up": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.5s ease-out",
                "slide-in": "slide-in 0.3s ease-out",
                shimmer: "shimmer 2s infinite",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "sans-serif"],
                display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
            },
            backgroundImage: {
                "hero-gradient":
                    "linear-gradient(135deg, hsl(220, 75%, 12%) 0%, hsl(250, 60%, 18%) 50%, hsl(270, 50%, 15%) 100%)",
                "card-gradient":
                    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                "brand-gradient":
                    "linear-gradient(135deg, hsl(220, 75%, 52%) 0%, hsl(250, 65%, 55%) 100%)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
