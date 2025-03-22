'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface MealRecord {
  id: string;
  mealType: string;
  date: string;
  photoUrl: string | null;
  items: FoodItem[];
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
};

export function MealRecordList() {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeals();
  }, []);

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