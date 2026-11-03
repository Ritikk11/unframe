import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/lib/config";
import SiteBackground from "@/components/SiteBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["600", "700"],
  variable: "--font-serif-italic",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#060713",
};

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Post full-screen photos on Instagram`,
  description: `Post full 9:16 photos and carousels on Instagram without cropping.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable} h-full dark`}
    >
      <body className="min-h-[100dvh] flex flex-col font-sans antialiased text-white bg-[#060713] selection:bg-[#00D2FF]/30 selection:text-white relative">
        <SiteBackground />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
