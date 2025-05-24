// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://008h.github.io/pixtitch/",
  base: "/pixtitch/",
  vite: {
    assetsInclude: ["**/*.svg"],

    build: {
      assetsDir: "assets",
    },

    plugins: [tailwindcss()],
  },
  svgo: {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            removeStyleElement: true,
            removeAttrs: {
              attrs: ['style']
            }
          }
        }
      }
    ]
  }
});