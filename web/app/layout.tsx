import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// IBM Plex: a typeface designed for engineering, which suits an industrial company.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const description =
  "Alpha Automations, Bengaluru: complete automated and semi-automated machines, PLC control panels, Poka-Yoke, Andon, vision and screwing solutions for every industry.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alpha Automations | Industrial Automation & Special Purpose Machines, Bengaluru",
    template: "%s | Alpha Automations",
  },
  description,
  applicationName: "Alpha Automations",
  keywords: [
    "industrial automation Bengaluru",
    "special purpose machines",
    "PLC control panel manufacturer",
    "Mitsubishi PLC",
    "Siemens PLC",
    "Poka-Yoke",
    "Andon system",
    "automatic screwing machine",
    "vision inspection system",
  ],
  openGraph: {
    type: "website",
    siteName: "Alpha Automations",
    locale: "en_IN",
    title: "Alpha Automations | Industrial Automation, Bengaluru",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
