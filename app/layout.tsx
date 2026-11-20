import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "Receipt" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-100 font-sans antialiased md:bg-neutral-100">{children}</body>
    </html>
  );
}
