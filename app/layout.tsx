import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ホームマート - センチュリー21加盟店 | 奈良県北葛城郡",
  description: "奈良県北葛城郡の不動産会社ホームマート。物件検索、売却査定、不動産の購入・売却をお手伝いします。",
  manifest: "/manifest.webmanifest",
  themeColor: "#f97316",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ホームマート"
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://homemart.com",
    title: "ホームマート - センチュリー21加盟店",
    description: "奈良県北葛城郡の不動産会社ホームマート",
    siteName: "ホームマート"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <Breadcrumb />
        <main>
          {children}
        </main>
        <Footer />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
