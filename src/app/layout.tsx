import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from './components/Navigation';
import Provider from './Provider';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI食事管理アプリ',
  description: 'AIを活用して食事の栄養バランスを分析し、健康的な食生活をサポートします。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Provider>
          <ToastProvider>
            <Navigation />
            <div className="min-h-screen pt-16 pb-20">
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </ToastProvider>
        </Provider>
      </body>
    </html>
  );
}
