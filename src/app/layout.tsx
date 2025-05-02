import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MuiProvider } from "@/components/providers/MuiProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RED10X Admin",
  description: "RED10X Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MuiProvider>{children}</MuiProvider>
        <Toaster />
      </body>
    </html>
  );
}
