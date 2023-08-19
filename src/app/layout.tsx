import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PageHeader } from "~/components/page-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clippy",
  description: "Self-hosted clips",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="144x144"
          href="/favicon-144x144.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon-192x192.png"
        />
      </head>
      <body className={inter.className}>
        <PageHeader />
        {children}
      </body>
    </html>
  );
}
