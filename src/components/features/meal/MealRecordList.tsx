'use client';

import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MEAL_TYPE_LABELS } from '@/constants/features/meal/constant';
import { DatabaseMealRecord } from '@/types';

/**
 * 食事記録リストのコンポーネント
 * @param selectedDateMeals 選択された日付の食事記録
 * @param handleDeleteMeal 食事記録の削除
 * @returns 食事記録リスト
 */
export function MealRecordList({ 
  selectedDateMeals, 
  handleDeleteMeal 
}: { 
  selectedDateMeals: DatabaseMealRecord[], 
  handleDeleteMeal: (id: string) => Promise<void> 
}) {

  /**
   * 食事タイプごとの背景色を設定
   */
  const getMealTypeColor = (type: string) => {
    switch(type) {
      case 'breakfast': return 'bg-amber-50 border-amber-100';
      case 'lunch': return 'bg-emerald-50 border-emerald-100';
      case 'dinner': return 'bg-indigo-50 border-indigo-100';
      case 'snack': return 'bg-rose-50 border-rose-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  /**
   * 食事タイプごとのテキスト色を設定
   */
  const getMealTypeTextColor = (type: string) => {
    switch(type) {
      case 'breakfast': return 'text-amber-700';
      case 'lunch': return 'text-emerald-700';
      case 'dinner': return 'text-indigo-700';
      case 'snack': return 'text-rose-700';
      default: return 'text-gray-700';
    }
  };

  /**
   * 食事記録がない場合の表示
   */
  if (selectedDateMeals.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
        </svg>
        <p className="text-base">食事記録がありません</p>
      </div>
    );
  }

  /**
   * 食事記録リストの表示
   */
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealType => {
          const mealsOfType = selectedDateMeals.filter(meal => meal.mealType === mealType);
          if (mealsOfType.length === 0) return null;

          // 食事タイプごとの合計カロリーを計算
          const totalCalories = mealsOfType.reduce((total, meal) => {
            return total + meal.items?.reduce((mealTotal, item) => mealTotal + (item.totalCalories || 0), 0) || 0;
          }, 0);
          
          return (
            <div key={mealType} className={`rounded-xl border p-0.5 shadow-sm ${getMealTypeColor(mealType)}`}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className={`flex items-center gap-2 ${getMealTypeTextColor(mealType)} font-medium`}>
                    <h3 className="text-md">
                      {MEAL_TYPE_LABELS[mealType]}
                    </h3>
                  </div>
                  <div className={`text-sm font-semibold ${getMealTypeTextColor(mealType)}`}>
                    {Math.round(totalCalories)} kcal
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  {mealsOfType.map((meal, mealIndex) => (
                    <div key={`${mealType}-${mealIndex}-${meal.id}`} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="divide-y divide-gray-100">
                        {meal.items?.map((item, itemIndex) => (
                          <div 
                            key={`${meal.id}-item-${itemIndex}`} 
                            className={`flex justify-between py-2 ${itemIndex === 0 ? 'pt-0' : ''} ${itemIndex === meal.items.length - 1 ? 'pb-0' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <span className="text-gray-500 text-sm">{item.quantity}{item.unit}</span>
                            </div>
                            <div className="text-gray-700 font-medium">
                              {Math.round(item.totalCalories)}kcal
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                        <Link 
                          href={`/meals/${meal.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 新規食事記録ボタン */}
      <div className="mt-6 flex justify-center">
        <Link 
          href="/meals/new" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新しい食事を記録
        </Link>
      </div>
    </>
  );
} 