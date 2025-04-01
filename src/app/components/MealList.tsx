'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Pagination } from './Pagination';
import type { MealListProps } from '@/types';

/**
 * 食事記録の種類のラベル
 */
const MEAL_TYPE_LABELS = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食'
} as const;

/**
 * ページごとの表示件数
 */
const ITEMS_PER_PAGE = 5;

/**
 * 食事記録リストコンポーネント
 * @param meals 食事記録リスト
 * @param onDelete 削除時のコールバック関数
 */
export function MealList({ meals, onDelete }: MealListProps) {
  const [collapsedMealIds, setCollapsedMealIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filteredMeals, setFilteredMeals] = useState(meals);

  // 日付でフィルタリング
  useEffect(() => {
    if (selectedDate) {
      const filtered = meals.filter(meal => {
        const mealDate = new Date(meal.date);
        const compareDate = new Date(selectedDate);
        return isSameDay(mealDate, compareDate);
      });
      setFilteredMeals(filtered);
      setCurrentPage(1); // ページをリセット
    } else {
      setFilteredMeals(meals);
    }
  }, [selectedDate, meals]);

  const totalPages = Math.ceil(filteredMeals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMeals = filteredMeals.slice(startIndex, endIndex);

  const handleToggleCollapse = (id: string) => {
    setCollapsedMealIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'M月d日(E) HH:mm', { locale: ja });
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

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        食事記録がありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <CalendarIcon className="h-5 w-5 text-gray-700" />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={getMinDate()}
            max={getMaxDate()}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-800 font-medium text-sm"
          />
          {selectedDate && (
            <button
              onClick={clearDateFilter}
              className="text-xs text-gray-700 hover:text-gray-900 font-medium"
            >
              すべて表示
            </button>
          )}
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          選択された日付の食事記録はありません
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentMeals.map((meal) => {
              const isCollapsed = collapsedMealIds.has(meal.id);
              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 space-y-2 xs:space-y-0">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between">
                      <div className="flex items-center gap-2 flex-wrap xs:flex-nowrap">
                        <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 shrink-0">
                          {MEAL_TYPE_LABELS[meal.mealType]}
                        </span>
                        <span className="text-gray-700 font-medium whitespace-nowrap">{formatDate(meal.date)}</span>
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-2 xs:mt-0">
                        <Link
                          href={`/meals/${meal.id}/edit`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('この食事記録を削除してもよろしいですか？')) {
                              onDelete(meal.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleCollapse(meal.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={isCollapsed ? '詳細を表示' : '詳細を非表示'}
                        >
                          {isCollapsed ? (
                            <ChevronDownIcon className="w-5 h-5" />
                          ) : (
                            <ChevronUpIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {!isCollapsed && (
                      <div className="mt-4 pl-4 border-l-2 border-blue-100">
                        <ul className="space-y-2">
                          {meal.items.map((item) => (
                            <li key={item.id} className="text-gray-700">
                              <span className="font-medium">{item.name}</span>
                              <span className="mx-2">:</span>
                              <span>{item.quantity}{item.unit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          <div className="text-center text-sm text-gray-500">
            {filteredMeals.length}件中 {startIndex + 1}~{Math.min(endIndex, filteredMeals.length)}件を表示
          </div>
        </>
      )}
    </div>
  );
} 