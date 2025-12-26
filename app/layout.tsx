import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FREEDOM - Stellar Wallet",
  description: "FREEDOM - A modern Stellar wallet for Ghana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

