// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://pixtitch.net",
  base: "/",
  vite: {
    assetsInclude: ["**/*.svg"],
    build: {
      assetsDir: "assets",
    },
    plugins: [tailwindcss()]
  }
});