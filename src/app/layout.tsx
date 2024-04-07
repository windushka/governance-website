import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "./navLinks";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { LinkPure, appTheme, NetworkSelectorPure } from './ui/common';
import { getAppContext } from './lib/appContext';

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
  const appContext = getAppContext();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <AntdRegistry>
          <header className="container grow-0 py-4 flex flex-row justify-between items-center">
            <div className="flex flex-row gap-4 items-center">
              <Link href="/" className="text-2xl">Etherlink governance</Link>
              <NetworkSelectorPure currentConfigKey={appContext.config.key} allConfigs={appContext.allConfigs} />
            </div>
            <NavLinks />
          </header>
          <main className="container grow flex flex-col">
            {children}
          </main>
          <footer className={`container grow-0 text-center text-sm ${appTheme.disabledTextColor} border-t ${appTheme.borderColor} p-2 mt-4 `}>
            {new Date().getFullYear()}
            &nbsp;| <LinkPure href="https://www.etherlink.com/" target="_blank" >Etherlink</LinkPure>
            &nbsp;| <LinkPure href="https://docs.etherlink.com/" target="_blank" >Documentation</LinkPure>
            &nbsp;| <LinkPure href="#" >Terms of use</LinkPure>
          </footer>
        </AntdRegistry>
      </body>
    </html >
  );
}
