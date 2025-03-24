import tailwindcssAnimate from "tailwindcss-animate";
import config from "@bltzr-gg/ui/tailwind";
import tailwindMotion from "tailwindcss-motion";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.tsx", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
  presets: [config],
  plugins: [tailwindcssAnimate, tailwindMotion],
};
