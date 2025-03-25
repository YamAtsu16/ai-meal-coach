'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FireIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import type { DatabaseMealRecord } from '@/types';

const MEAL_TYPE_LABELS = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食'
} as const;

export function DashboardCharts() {
  const [meals, setMeals] = useState<DatabaseMealRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 定期的にデータを更新 (30秒ごと)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMeals();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // 選択された日付の食事記録をフィルタリング
  const selectedDateMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    mealDate.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    
    return mealDate.getTime() === compareDate.getTime();
  });

  // 選択された日付の総栄養価を計算
  const totalNutrition = selectedDateMeals.reduce((acc, meal) => {
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

  // 栄養バランスのデータを計算
  const nutritionData = [
    { name: 'タンパク質', value: totalNutrition.protein * 4, color: '#3B82F6' },
    { name: '脂質', value: totalNutrition.fat * 9, color: '#EF4444' },
    { name: '炭水化物', value: totalNutrition.carbs * 4, color: '#10B981' },
  ];

  // 総カロリーが0の場合、円グラフの表示を調整
  const pieData = totalNutrition.kcal > 0 
    ? nutritionData 
    : nutritionData.map(item => ({ ...item, value: item.name === 'タンパク質' ? 1 : 0 }));

  const handleRefresh = () => {
    fetchMeals();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // 選択できる日付の範囲を設定（過去1ヶ月から今日まで）
  const getMinDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (isLoading && meals.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
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
          onClick={handleRefresh}
          className="ml-4 text-red-600 underline"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={getMinDate()}
            max={getMaxDate()}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-800 font-medium text-sm min-w-[150px]"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? '更新中...' : '更新'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 総摂取カロリー */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FireIcon className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedDate === new Date().toISOString().split('T')[0] ? '今日' : selectedDate.replace(/-/g, '/')}の総摂取カロリー
            </h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {Math.round(totalNutrition.kcal)}
            </span>
            <span className="text-gray-600">kcal</span>
          </div>
        </div>

        {/* 栄養バランス */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              栄養バランス
            </h2>
          </div>
          {totalNutrition.kcal === 0 ? (
            <div className="flex justify-center items-center h-[200px] text-gray-500">
              データがありません
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-1/2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Math.round(Number(value))} kcal`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="space-y-4">
                  {nutritionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-gray-800">{item.name}</span>
                          <span className="text-sm font-medium text-gray-800">{Math.round(item.value)}kcal</span>
                        </div>
                        <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${totalNutrition.kcal > 0 ? (item.value / totalNutrition.kcal) * 100 : 0}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* その日の食事記録 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedDate === new Date().toISOString().split('T')[0] ? '今日' : selectedDate.replace(/-/g, '/')}の食事記録
          </h2>
        </div>
        
        {selectedDateMeals.length === 0 ? (
          <div className="flex justify-center items-center h-24 text-gray-500">
            食事記録がありません
          </div>
        ) : (
          <div className="space-y-6">
            {/* 朝食・昼食・夕食・間食に分けて表示 */}
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealType => {
              const mealsOfType = selectedDateMeals.filter(meal => meal.mealType === mealType);
              if (mealsOfType.length === 0) return null;
              
              return (
                <div key={mealType} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    {MEAL_TYPE_LABELS[mealType]}
                  </h3>
                  <div className="space-y-3">
                    {mealsOfType.map(meal => (
                      <div key={meal.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {meal.items.map(item => (
                            <div key={item.id} className="flex justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{item.name}</span>
                                <span className="text-gray-600">{item.quantity}{item.unit}</span>
                              </div>
                              <div className="text-gray-800 font-medium">
                                {Math.round(item.totalCalories)}kcal
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 