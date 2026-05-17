// app/manifest.js — Next 16 metadata route, served as /manifest.webmanifest.
// Makes the app installable from iOS Safari ("Add to Home Screen") and
// Chrome / Edge / Android (PWA install prompt).

export default function manifest() {
  return {
    name: "ТокенСток",
    short_name: "ТокенСток",
    description: "Маркетплейс 218 нейросетей. Платишь только за факт использования.",
    start_url: "/chat",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f6",
    theme_color: "#faf9f6",
    icons: [
      { src: "/icon.svg",       sizes: "any",     type: "image/svg+xml", purpose: "any maskable" },
      { src: "/icon-512.png",   sizes: "512x512", type: "image/png",     purpose: "any" },
      { src: "/icon-192.png",   sizes: "192x192", type: "image/png",     purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    categories: ["productivity", "utilities"],
    lang: "ru-RU",
  };
}
