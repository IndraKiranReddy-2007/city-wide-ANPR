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
        command: {
          bg: '#070b14',
          surface: '#0b1329',
          card: '#111d38',
          cardHover: '#162547',
          border: '#1e293b',
          borderLight: '#334155',
          accent: '#06b6d4',
          accentDark: '#0891b2',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          critical: '#dc2626',
          cyan: '#22d3ee',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          muted: '#64748b',
          text: '#f1f5f9',
          textDim: '#94a3b8',
        }
      },
      fontFamily: {
        heading: ['"Chakra Petch"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
