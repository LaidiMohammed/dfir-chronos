import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DFIR Lab — Interactive Digital Forensics Labs",
  description:
    "Hands-on, methodology-first digital forensics and incident response labs: disk timeline reconstruction, memory forensics, IoC extraction and containment. Built for analysts who testify their work.",
  applicationName: "DFIR Lab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
