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
        'hm-yellow': '#F4C84B',
        'hm-yellow-deep': '#E6B62F',
        'hm-ink': '#15130D',
        'hm-ivory': '#FFF6DE',
        'hm-sand': '#F8E7B8',
      },
      fontFamily: {
        jp: ['"Noto Sans JP"', "ui-sans-serif", "system-ui"],
        sans: ['var(--font-body)', '"Noto Sans JP"', "ui-sans-serif", "system-ui"],
        display: ['var(--font-display)', '"Shippori Mincho B1"', '"Noto Sans JP"', "serif"],
      },
    },
  },
  plugins: [],
}
export default config
