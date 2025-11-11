import type { Config } from "tailwindcss";
// If you want animations on v4, use the v4-compatible package:

const config: Config = {
  // content is ignored by v4’s new scanner but safe to keep:
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
};

export default config;
