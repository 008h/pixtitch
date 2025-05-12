// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://008h.github.io/pixtitch/",
  base: "/pixtitch/",
  vite: {
    assetsInclude: ["**/*.svg"],
  },
});
