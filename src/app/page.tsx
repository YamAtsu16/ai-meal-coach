'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useErrorHandler } from '@/lib/hooks';

/**
 * ランディングページ（トップページ）
 */
export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { handleError } = useErrorHandler();

  // 認証状態のチェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        const data = await response.json();
        
        setIsAuthenticated(data.authenticated);
        
        // 認証済みの場合はホームページにリダイレクト
        // ミドルウェアでのリダイレクトと二重で行うことで、
        // クライアントサイド・サーバーサイド両方で対応
        if (data.authenticated) {
          router.replace('/home');
          return; // 早期リターンを追加
        }
        
        setIsLoading(false);
      } catch (error) {
        handleError(error, '認証状態の確認中にエラーが発生しました');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router, handleError]);

  // ローディング中は何も表示しない
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 認証済みの場合はレンダリングを停止
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* ヒーローセクション */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* テキスト部分 */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              あなたの食事を<span className="text-blue-600">AI</span>がサポート
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              栄養バランスの最適化、目標達成へのアドバイス、食事記録の簡単管理。
              あなたの健康的な食生活をAIが総合的にサポートします。
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register" className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors text-center">
                無料で始める
              </Link>
              <Link href="#features" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors text-center">
                詳しく見る
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">アプリの特徴</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              className="bg-blue-50 p-8 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">AIによる栄養分析</h3>
              <p className="text-gray-600">
                食事内容を入力するだけで、AIが栄養バランスを分析。あなたの目標に合わせたアドバイスを提供します。
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-blue-50 p-8 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">簡単食事記録</h3>
              <p className="text-gray-600">
                豊富な食品データベースと使いやすいインターフェースで、食事記録をスムーズに。めんどうな計算は自動で行います。
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-blue-50 p-8 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">目標設定と進捗管理</h3>
              <p className="text-gray-600">
                あなたの目標（減量、維持、増量）に合わせた栄養摂取量を設定。日々の進捗を可視化して継続をサポートします。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">今すぐ始めてみませんか？</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            無料アカウントを作成して、AIがあなたの食生活をサポート。
            健康的な食習慣づくりを始めましょう。
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/register" className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors">
              無料で始める
            </Link>
            <Link href="/login" className="px-8 py-3 border border-white text-white rounded-lg text-lg font-medium hover:bg-blue-500 transition-colors">
              ログイン
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
