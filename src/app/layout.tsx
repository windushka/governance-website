import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { NavLinks, appTheme, NetworkSelectorPure, FooterPure } from '@/app/components';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { getAppContext } from '@/lib/appContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Etherlink governance',
  description: 'Etherlink governance current state, history and analytics',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const appContext = getAppContext();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <AntdRegistry>
          <header className={`border-b ${appTheme.borderColor} container grow-0 py-4 flex flex-col justify-center items-center gap-x-4 gap-y-6 sm:flex-row sm:justify-between sm:border-b-0`}>
            <div className="flex flex-col sm:flex-row gap-x-4 gap-y-2 justify-center items-center">
              <Link href="/" className="text-2xl text-center">Etherlink governance</Link>
              <NetworkSelectorPure currentConfigKey={appContext.config.key} allConfigs={appContext.allConfigs} />
            </div>
            <NavLinks />
          </header>
          <main className="container grow flex flex-col">
            {children}
          </main>
          <FooterPure />
        </AntdRegistry>
      </body>
    </html >
  );
};


export default RootLayout;