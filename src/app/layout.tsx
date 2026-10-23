import type { Metadata, Viewport } from "next";
import { Noto_Serif, Manrope, Amiri, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.scss";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { OfflineBanner, Toaster } from "@/components/client";
import ServiceWorker from "@/components/ServiceWorker";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

// Only downloaded when Urdu text is on screen.
const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "700"],
  preload: false,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Quran - Islam | The Global Guide", template: "%s | The Global Guide" },
  description: "A modern, serene sanctuary for Islamic wisdom, prayer times, and supplications.",
  applicationName: "The Global Guide",
  openGraph: { type: "website", siteName: "The Global Guide" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1512" },
  ],
};

// Applies saved theme and reader sizes before first paint, so nothing flashes.
const PREFS_SCRIPT = `try{var t=JSON.parse(localStorage.getItem("ic:theme")||"{}").mode;if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;var r=JSON.parse(localStorage.getItem("ic:reader")||"{}"),s=document.documentElement.style;if(r.arabicSize)s.setProperty("--quran-size",r.arabicSize+"rem");if(r.lineHeight)s.setProperty("--quran-leading",r.lineHeight);if(r.urduSize)s.setProperty("--urdu-size",r.urduSize+"rem")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSerif.variable} ${manrope.variable} ${amiri.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col pt-[72px] bg-[var(--color-surface)]">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[var(--color-primary)] focus:text-[var(--color-on-primary)]">
          Skip to content
        </a>
        <Navigation />
        <OfflineBanner />
        <main id="main" className="flex-1 shrink-0">{children}</main>
        <Footer />
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  );
}
