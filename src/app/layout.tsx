import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import "./globals.scss";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quran - Islam | The Global Guide",
  description: "A modern, serene sanctuary for Islamic wisdom, prayer times, and supplications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-[72px] bg-[var(--color-surface)]">
        <Navigation />
        <main className="flex-1 shrink-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
