/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode (default) — Claude warm cream/terracotta
        background:      '#FAF9F5',
        card:            '#F5F2EA',
        cardBorder:      '#E6DFD2',
        textPrimary:     '#2F2F2F',
        textSecondary:   '#5A5A5A',

        // Shared accents (mapped to Claude palette)
        accentPink:      '#D97757', // brand-500
        secondaryPurple: '#F3AE8C', // brand-300
        cyanAccent:      '#EA8D68', // brand-400
        successGreen:    '#2E8B57', // success
        warningOrange:   '#D97706', // warning
        dangerRed:       '#DC2626', // error
        borderGlow:      '#D97757',

        // Dark mode overrides via CSS vars (see global.css)
        'dark-bg':       '#1C1B18',
        'dark-card':     '#262420',
      },
      fontFamily: {
        sans: ['Inter', 'Sora', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm':  '0 2px 8px rgba(244,63,127,0.08)',
        'warm-md':  '0 4px 20px rgba(244,63,127,0.12)',
        'warm-lg':  '0 8px 40px rgba(244,63,127,0.16)',
        'dark-sm':  '0 2px 8px rgba(0,0,0,0.4)',
        'dark-md':  '0 4px 20px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
