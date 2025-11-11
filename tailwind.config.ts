import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  import tailwindcssAnimate from "tailwindcss-animate";

plugins: [
  tailwindcssAnimate,
],

};

export default config;
