'use client'

import Link from 'next/link';
import { GlobalMessagePure } from './components';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  return (
    <html>
      <body className="flex grow-1 min-h-screen">
        <div className="container flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <GlobalMessagePure>500 | Something went wrong</GlobalMessagePure>
            <Link href="/">Home</Link>
          </div>
        </div>
      </body>
    </html>
  )
};

export default GlobalError;