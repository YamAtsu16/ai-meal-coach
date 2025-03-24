'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FireIcon, ChartBarIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { DatabaseMealRecord } from '@/types';

export function MealHistory() {
  const [meals, setMeals] = useState<DatabaseMealRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 食事記録を取得
  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/meals');
      if (!response.ok) {
        throw new Error('食事記録の取得に失敗しました');
      }
      const meals: DatabaseMealRecord[] = await response.json();
      setMeals(meals);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード時にデータを取得
  useEffect(() => {
    fetchMeals();
  }, []);

  // 月を変更する
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // 現在の月の日付を取得
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // 指定した日付の食事記録を取得
  const getMealsForDate = (date: Date) => {
    return meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return isSameDay(mealDate, date);
    });
  };

  // 指定した日付の栄養素を計算
  const calculateNutritionForDate = (date: Date) => {
    const mealsForDate = getMealsForDate(date);
    return mealsForDate.reduce((acc, meal) => {
      const mealTotal = meal.items.reduce((itemAcc, item) => ({
        kcal: itemAcc.kcal + (item.totalCalories || 0),
        protein: itemAcc.protein + (item.totalProtein || 0),
        fat: itemAcc.fat + (item.totalFat || 0),
        carbs: itemAcc.carbs + (item.totalCarbs || 0),
      }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });

      return {
        kcal: acc.kcal + mealTotal.kcal,
        protein: acc.protein + mealTotal.protein,
        fat: acc.fat + mealTotal.fat,
        carbs: acc.carbs + mealTotal.carbs,
      };
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });
  };

  if (isLoading && meals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i+7} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
        <button 
          onClick={fetchMeals}
          className="ml-4 text-red-600 underline"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            過去の食事記録
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth('prev')}
              className="p-1 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-gray-800">
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </span>
            <button
              onClick={() => changeMonth('next')}
              className="p-1 text-gray-700 hover:text-gray-900"
              disabled={isSameDay(startOfMonth(currentMonth), startOfMonth(new Date())) || 
                startOfMonth(currentMonth) > startOfMonth(new Date())}
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center font-medium text-gray-800">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map(day => {
            const mealsForDay = getMealsForDate(day);
            const nutrition = calculateNutritionForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = new Date();
            const isPast = day < today || isSameDay(day, today);

            return (
              <div 
                key={day.toISOString()} 
                className={`p-1 border rounded-lg ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 
                  isPast && mealsForDay.length > 0 ? 'border-gray-200 hover:border-blue-300 cursor-pointer' : 
                  'border-gray-100'
                }`}
                onClick={() => isPast && mealsForDay.length > 0 ? setSelectedDate(day) : null}
              >
                <div className="text-center text-sm font-medium mb-1">
                  {format(day, 'd日', { locale: ja })}
                </div>
                {mealsForDay.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-xs font-medium text-gray-800">
                      {Math.round(nutrition.kcal)}kcal
                    </div>
                    <div className="flex justify-center gap-1 mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" style={{ opacity: nutrition.protein > 0 ? 1 : 0.2 }}></div>
                      <div className="w-2 h-2 rounded-full bg-red-500" style={{ opacity: nutrition.fat > 0 ? 1 : 0.2 }}></div>
                      <div className="w-2 h-2 rounded-full bg-green-500" style={{ opacity: nutrition.carbs > 0 ? 1 : 0.2 }}></div>
                    </div>
                  </div>
                ) : isPast ? (
                  <div className="h-[28px] flex items-center justify-center">
                    <span className="text-xs text-gray-400">記録なし</span>
                  </div>
                ) : (
                  <div className="h-[28px]"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 選択された日付の詳細 */}
      {selectedDate && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}の摂取状況
            </h2>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              閉じる
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 総摂取カロリー */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="w-5 h-5 text-orange-500" />
                <h3 className="text-md font-medium text-gray-800">総摂取カロリー</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(calculateNutritionForDate(selectedDate).kcal)}
                </span>
                <span className="text-gray-600">kcal</span>
              </div>
            </div>

            {/* 栄養バランス */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-md font-medium text-gray-800">栄養バランス</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mb-1"></div>
                  <div className="text-xs font-medium text-gray-800">タンパク質</div>
                  <div className="text-sm font-bold text-gray-900">
                    {Math.round(calculateNutritionForDate(selectedDate).protein * 4)}kcal
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
                  <div className="text-xs font-medium text-gray-800">脂質</div>
                  <div className="text-sm font-bold text-gray-900">
                    {Math.round(calculateNutritionForDate(selectedDate).fat * 9)}kcal
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
                  <div className="text-xs font-medium text-gray-800">炭水化物</div>
                  <div className="text-sm font-bold text-gray-900">
                    {Math.round(calculateNutritionForDate(selectedDate).carbs * 4)}kcal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 