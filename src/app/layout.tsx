import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "./navLinks";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import clsx from 'clsx';
import { LinkPure, appTheme } from './ui/common';

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
        <footer className={`container grow-0 text-center text-sm ${appTheme.disabledTextColor} border-t ${appTheme.borderColor} p-2 mt-4 `}>
          {new Date().getFullYear()} | <LinkPure href="https://www.etherlink.com/">Etherlink</LinkPure> | <LinkPure href="https://docs.etherlink.com/">Documentation</LinkPure> | Terms of use
        </footer>
      </body>
    </html >
  );
}
