'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FoodSearchResult } from '@/lib/types';

/**
 * 食品検索コンポーネントのProps
 */
interface FoodSearchProps {
  onSelect: (food: FoodSearchResult) => void;
}

/**
 * 食品検索コンポーネント
 * @param onSelect 選択時のコールバック関数
 */
export function FoodSearch({ onSelect }: FoodSearchProps) {
  /** 検索クエリ */
  const [query, setQuery] = useState('');
  /** 検索結果 */
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  /** ローディング状態 */
  const [isLoading, setIsLoading] = useState(false);
  /** エラー */
  const [error, setError] = useState<string | null>(null);
  /** 検索コンテナの参照 */
  const searchContainerRef = useRef<HTMLDivElement>(null);

  /**
   * クリックされた場所が検索コンテナの外にある場合、検索結果をクリア
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * 食品を検索
   */
  const searchFood = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/food/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('食品の検索に失敗しました');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 食品を選択
   */
  const handleSelect = (food: FoodSearchResult) => {
    onSelect(food);
    // 選択後にリセット
    setQuery('');
    setResults([]);
  };

  return (
    <div className="w-full" ref={searchContainerRef}>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                searchFood();
              }
            }}
            placeholder="食品名を入力して検索..."
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          <button
            type="button"
            onClick={searchFood}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <ul className="divide-y divide-gray-200">
              {results.map((food, index) => (
                <li
                  key={`${food.foodId}_${index}`}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(food)}
                >
                  <div className="font-medium text-gray-900">{food.label}</div>
                  <div className="mt-1 text-gray-600">
                    {Math.round(food.nutrients.ENERC_KCAL)}kcal / 
                    タンパク質: {Math.round(food.nutrients.PROCNT)}g / 
                    脂質: {Math.round(food.nutrients.FAT)}g / 
                    炭水化物: {Math.round(food.nutrients.CHOCDF)}g
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
} 