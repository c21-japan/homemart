import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'homemart-blue': '#0066CC',
        'homemart-gold': '#FFD700',
        primary: "#22C55E", // メイン緑
        navy: "#1E293B",    // 濃紺
        gold: "#A19276",    // 既存デザインとの調和用
        cream: "#F8F6F3",
      },
      fontFamily: {
        jp: ['"Noto Sans JP"', "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
}
export default config
