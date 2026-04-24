import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DailyKids",
  description: "Routines et tâches quotidiennes pour les enfants.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DailyKids",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32" },
      { url: "/icons/favicon-16.png", sizes: "16x16" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#3BB0E8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
