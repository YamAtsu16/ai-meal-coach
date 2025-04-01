'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MealRecordForm } from '@/app/components/MealRecordForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { DatabaseMealRecord } from '@/types';

/**
 * 食事編集ページのProps
 */
export interface EditMealRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 食事編集ページ
 */
export default function EditMealRecord({ params }: EditMealRecordPageProps) {
  /** ルーティング */
  const router = useRouter();
  /** 食事記録 */
  const [meal, setMeal] = useState<DatabaseMealRecord | null>(null);
  /** ローディング状態 */
  const [isLoading, setIsLoading] = useState(true);
  /** エラーメッセージ */
  const [error, setError] = useState<string | null>(null);
  /** クエリパラメータ */
  const resolvedParams = use(params);

  /**
   * 食事記録の取得
   */
  useEffect(() => {
    // 非同期関数の定義
    const fetchMeal = async () => {
      try {
        setIsLoading(true);
        // 食事記録の取得
        const response = await fetch(`/api/meals/${resolvedParams.id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('食事記録の取得に失敗しました');
        }

        const data = await response.json();
        if (!data) {
          throw new Error('食事記録が見つかりません');
        }

        // MongoDBの_idをidとしても設定
        const mealWithId = {
          ...data,
          id: data._id || data.id // _idがある場合はそれを使用、なければ既存のidを使用
        };

        setMeal(mealWithId);
      } catch (error) {
        console.error('食事記録の取得エラー:', error);
        setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchMeal();
    }
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">食事記録の編集</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {meal && (
              <MealRecordForm
                initialData={meal}
                onSuccess={() => router.push('/')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 