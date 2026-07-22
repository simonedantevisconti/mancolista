import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: [
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "mancolista-logo.webp",
        "retro.webp",
      ],

      manifest: {
        id: "/",
        name: "MancoLista",
        short_name: "MancoLista",

        description:
          "Gestisci le tue collezioni di carte, le mancanti e le doppie.",

        lang: "it",
        start_url: "/",
        scope: "/",

        display: "standalone",
        orientation: "portrait-primary",

        background_color: "#111111",
        theme_color: "#ff7a00",

        categories: ["entertainment", "utilities"],

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}"],

        navigateFallback: "/index.html",

        runtimeCaching: [
          {
            urlPattern: ({ request }) => {
              return request.destination === "image";
            },

            handler: "CacheFirst",

            options: {
              cacheName: "mancolista-images",

              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: ({ url }) => {
              return (
                url.hostname.includes("tcgdex.net") ||
                url.hostname.includes("pokemontcg.io")
              );
            },

            handler: "NetworkFirst",

            options: {
              cacheName: "mancolista-card-api",

              networkTimeoutSeconds: 8,

              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});
