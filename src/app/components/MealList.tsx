'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Pagination } from './Pagination';
import type { MealListProps } from '@/types/meal';

const MEAL_TYPE_LABELS = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食'
} as const;

const ITEMS_PER_PAGE = 5;

export function MealList({ meals, onDelete }: MealListProps) {
  const [collapsedMealIds, setCollapsedMealIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(meals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMeals = meals.slice(startIndex, endIndex);

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

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        食事記録がありません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {currentMeals.map((meal) => {
          const isCollapsed = collapsedMealIds.has(meal.id);
          return (
            <div
              key={meal.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 mr-2">
                      {MEAL_TYPE_LABELS[meal.mealType]}
                    </span>
                    <span className="text-gray-600">{formatDate(meal.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
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
        {meals.length}件中 {startIndex + 1}~{Math.min(endIndex, meals.length)}件を表示
      </div>
    </div>
  );
} 