import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Sunny's Garden — Handcrafted Cedar Planter Boxes",
    template: "%s | Sunny's Garden",
  },
  description:
    "Handcrafted cedar planter boxes, made to order. The Sunny Collection features raised planters built with western red cedar using traditional frame-and-panel joinery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sunnys.garden"),
  openGraph: {
    title: "Sunny's Garden — Handcrafted Cedar Planter Boxes",
    description:
      "Handcrafted cedar planter boxes, made to order. Built with western red cedar using traditional frame-and-panel joinery.",
    url: "/",
    siteName: "Sunny's Garden",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-stone-900`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
