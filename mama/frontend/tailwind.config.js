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
        // Light mode (default) — warm cream
        background:      '#FFF8F5',
        card:            '#FFF0EB',
        cardBorder:      '#F5D9D0',
        textPrimary:     '#1C0F0A',
        textSecondary:   '#7C5C54',

        // Shared accents
        accentPink:      '#F43F7F',
        secondaryPurple: '#C084FC',
        cyanAccent:      '#06B6D4',
        successGreen:    '#16A34A',
        warningOrange:   '#EA580C',
        dangerRed:       '#DC2626',
        borderGlow:      '#F43F7F',

        // Dark mode overrides via CSS vars (see global.css)
        'dark-bg':       '#0D0A1A',
        'dark-card':     '#1A1528',
      },
      fontFamily: {
        sans: ['Sora', 'Inter', 'sans-serif'],
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
