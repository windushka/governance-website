import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'mid-black': 'rgb(28, 28, 28)',
        'light-black': 'rgb(49, 49, 49)',
        'dark-green': 'rgb(89, 173, 140)',
        'light-green': 'rgb(182, 254, 218)',
        'new-green': 'rgb(56, 255, 156)',
        'light-white': 'rgb(62, 64, 64)'
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '12px',
        sm: '12px',
        md: '12px',
        lg: '12px',
        xl: '32px',
        '2xl': '32px',
      },
      screens: {
        sm: '664px',
        md: '792px',
        lg: '1048px',
        xl: '1344px',
        '2xl': '1344px',
      },
    }
  },
  plugins: [],
};
export default config;
