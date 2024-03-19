import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "./navLinks";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Etherlink governance",
  description: "Etherlink governance current state, history and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <header className="container grow-0 mb-4 py-4 border-b flex flex-row justify-between items-center">
          <Link href="/" className="text-2xl">Etherlink governance</Link>
          <NavLinks />
        </header>
        <main className="container grow flex flex-col">{children}</main>
        <footer className="container grow-0 text-center border-t border-slate-400 p-2 mt-4 text-slate-400">2024 - {new Date().getFullYear()} | Etherlink | Terms | Privacy</footer>
      </body>
    </html>
  );
}
