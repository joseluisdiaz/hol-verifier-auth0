/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            boxShadow: {
                button: 'inset 0 3px 3px 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(0,0,0,0.12)',
                'button-focus':
                    'inset 0 3px 3px 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(0,0,0,0.12), 0 0 0 4px rgba(99,102,241,0.2)',
            },
        },
    },
    plugins: [],
}
