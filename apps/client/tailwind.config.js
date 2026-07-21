// v 2.0 - Theme-aware colors using CSS variables
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
          hover: 'var(--background-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          secondary: 'var(--foreground-secondary)',
          muted: 'var(--foreground-muted)',
        },
        accent: {
          pink: 'var(--accent-pink)',
          purple: 'var(--accent-purple)',
          green: 'var(--accent-green)',
          blue: 'var(--accent-blue)',
          yellow: 'var(--accent-yellow)',
          red: 'var(--accent-red)',
        },
      },
      fontFamily: {
        // System fonts only — avoids Google Fonts network hop on cold start
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease',
        'slide-up': 'slideUp 200ms ease',
        'slide-in': 'slideIn 200ms ease',
        'slide-up-fade': 'slideUpFade 300ms ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpFade: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
