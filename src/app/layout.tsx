import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "./navLinks";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import clsx from 'clsx';
import { appTheme } from './ui/common';

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
        <header className="container grow-0 py-4 flex flex-row justify-between items-center">
          <Link href="/" className="text-2xl">Etherlink governance</Link>
          <NavLinks />
        </header>
        <main className="container grow flex flex-col">
          <AntdRegistry>{children}</AntdRegistry>
        </main>
        <footer className={`container grow-0 text-center border-t ${appTheme.borderColor} p-2 mt-4 text-slate-400`}>2024 - {new Date().getFullYear()} | Etherlink | Terms | Privacy</footer>
      </body>
    </html >
  );
}
