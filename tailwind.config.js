/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
    ],
    theme: {
        extend: {
            colors: {
                'postit-yellow': '#FFF9C4',
                'postit-pink': '#F8BBD0',
                'postit-blue': '#BBDEFB',
                'postit-green': '#C8E6C9',
                'postit-orange': '#FFE0B2',
                'postit-purple': '#E1BEE7',
                'postit-teal': '#B2DFDB',
                'postit-lime': '#F0F4C3',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'bounce-subtle': 'bounceSubtle 0.5s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
        },
    },
    plugins: [],
}
