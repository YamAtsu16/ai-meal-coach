'use client';

import { useEffect, useState } from 'react';
import { DashboardCharts } from './components/DashboardCharts';
import { MealList } from './components/MealList';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { DatabaseMealRecord } from '@/types/meal';

export default function Home() {
  const [meals, setMeals] = useState<DatabaseMealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = async () => {
    try {
      const response = await fetch('/api/meals');
      if (!response.ok) {
        throw new Error('食事記録の取得に失敗しました');
      }
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/meals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('食事記録の削除に失敗しました');
      }

      // 削除成功後、一覧を更新
      fetchMeals();
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <Link
            href="/record"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            食事を記録
          </Link>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">栄養摂取状況</h2>
            <DashboardCharts />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の食事記録</h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <MealList meals={meals} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
