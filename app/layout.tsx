import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "IBF – Innovator Bridge Foundry",
  description: "Where Founders and Talent Meet.",
};

import { Providers } from "@/components/Providers";
import NavBar from "@/components/NavBar";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#050508', color: '#f0f0f5' }}>
        <Providers>
          <NavBar />
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
          <footer className="border-t border-white/10 bg-black/30 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} IBF – Innovator Bridge Foundry. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

