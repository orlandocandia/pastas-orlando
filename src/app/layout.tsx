import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pastas Orlando - Pastas Artesanales en Posadas",
  description:
    "Pastas artesanales hechas con amor y tradición en Posadas, Misiones. Sorrentinos, ravioles, ñoquis, fettuccine y más. Envío gratis dentro de Posadas.",
  keywords: [
    "pastas artesanales",
    "Posadas",
    "Misiones",
    "sorrentinos",
    "ravioles",
    "ñoquis",
    "pastas caseras",
    "envío gratis",
  ],
  authors: [{ name: "Pastas Orlando" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "Pastas Orlando - Pastas Artesanales en Posadas",
    description:
      "Pastas artesanales hechas con amor y tradición. Envío gratis dentro de Posadas.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
