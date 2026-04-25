import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DailyKids",
    short_name: "DailyKids",
    description: "Routines et tâches quotidiennes pour les enfants, gérées en famille.",
    start_url: "/tasks",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#3BB0E8",
    theme_color: "#3BB0E8",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
