import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LivingTeak",
  description: "LivingTeak is a Sri Lankan company specializing in high-quality teak furniture. We offer a wide range of beautifully crafted pieces for your home and garden, combining timeless design with durability. Explore our collection and bring the warmth of teak into your living space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full w-full overflow-x-hidden flex flex-col">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
