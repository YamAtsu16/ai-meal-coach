import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider, ToastProvider } from '@/providers';
import { Navigation } from '@/components/common/layout/Navigation';
import { Footer } from '@/components/common/layout/Footer';

/** フォント */
const inter = Inter({ subsets: ['latin'] });

/** メタデータ */
export const metadata: Metadata = {
  title: 'AI食事管理アプリ',
  description: 'AIを活用して食事の栄養バランスを分析し、あなたの目的に合った健康的な食生活をサポートします。',
};

/**
 * ルートレイアウト
 * @param children 子要素
 * @returns ルートレイアウト
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <div className="min-h-screen pt-16">
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
