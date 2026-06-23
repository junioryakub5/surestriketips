import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Sure Strike Tips — Bet With Confidence",
  description:
    "Premium football predictions with guaranteed odds. Unlock expert betting slips with 2+, 5+, 10+ odds. Sure Strike Tips — bet with confidence.",
  keywords:
    "football predictions, betting tips, soccer predictions, betting odds, premium tips, sports betting, sure strike tips",
  openGraph: {
    title: "Sure Strike Tips — Bet With Confidence",
    description: "Expert football predictions with guaranteed odds. Bet with confidence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
