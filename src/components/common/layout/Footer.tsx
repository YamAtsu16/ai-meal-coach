'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * フッターコンポーネント
 * @returns フッターコンポーネント
 */
export function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // クライアントサイドでのみ現在の年を設定
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-800 text-gray-300 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className={`grid grid-cols-1 ${isAuthenticated ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-12`}>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">AI Meal Coach</h3>
            <p className="mb-4">
              あなたの健康的な食生活をAIでサポートするサービスです。
              栄養バランスの最適化から目標達成までをトータルでケアします。
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">リンク</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">機能紹介</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">よくある質問</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">利用規約</Link>
              </li>
            </ul>
          </div>
          {!isAuthenticated && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">アカウント</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">新規登録</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">ログイン</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-sm">© {currentYear} AI Meal Coach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 