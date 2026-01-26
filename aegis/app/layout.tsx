import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AegisProvider } from "@/lib/AegisProvider";
import { AuthModal } from "@/components/AuthStatus";
import GuidanceMessage from "@/components/GuidanceMessage";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aegis - AI Productivity Assistant",
  description: "Your personal Jarvis-style AI assistant for focused productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AegisProvider>
          <Header />
          <main className="pt-20">
            {children}
          </main>
          <AuthModal />
          <GuidanceMessage />
        </AegisProvider>
      </body>
    </html>
  );
}
