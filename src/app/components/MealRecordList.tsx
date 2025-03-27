'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { DatabaseMealRecord } from '@/types';

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
};

export function MealRecordList() {
  const [meals, setMeals] = useState<DatabaseMealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await fetch('/api/meals', {
        credentials: 'include',
      });
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

  const handleDelete = async (id: string) => {
    if (!confirm('この食事記録を削除してもよろしいですか？')) {
      return;
    }

    setIsDeleting(true);
    setDeleteTarget(id);

    try {
      const response = await fetch(`/api/meals/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('食事記録の削除に失敗しました');
      }

      setMeals(meals.filter(meal => meal.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        食事記録がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <div
          key={meal.id}
          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="inline-block px-2 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded">
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {format(new Date(meal.date), 'M月d日(E) HH:mm', { locale: ja })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/meals/${meal.id}/edit`}
                  className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(meal.id)}
                  disabled={isDeleting && deleteTarget === meal.id}
                  className={`p-1.5 transition-colors ${
                    isDeleting && deleteTarget === meal.id
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {meal.photoUrl && (
              <div className="mb-4">
                <img
                  src={meal.photoUrl}
                  alt="食事の写真"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-1">
              {meal.items.map((item) => (
                <div key={item.id} className="text-sm text-gray-700">
                  {item.name} ({item.quantity}{item.unit})
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 