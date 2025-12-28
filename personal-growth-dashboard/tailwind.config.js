/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pricilia: {
                    blue: '#4F46E5', // Indigo-600
                    dark: '#0F172A', // Slate-900
                    bg: '#F8FAFC',   // Slate-50
                    card: '#FFFFFF',
                    text: '#334155', // Slate-700
                    mint: '#10B981', // Emerald-500 for accents
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'hover': '0 20px 40px rgba(0, 0, 0, 0.08)',
            }
        },
    },
    plugins: [],
}
