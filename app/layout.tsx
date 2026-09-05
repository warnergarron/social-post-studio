import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRAME — Social Post Studio",
  description: "A fast, browser-based social post builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
