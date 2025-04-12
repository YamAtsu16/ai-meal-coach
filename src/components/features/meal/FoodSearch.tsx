'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FoodSearchResult } from '@/lib/types';
import { useErrorHandler } from '@/lib/hooks';

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
  /** 検索コンテナの参照 */
  const searchContainerRef = useRef<HTMLDivElement>(null);
  /** エラーハンドラー */
  const { handleError } = useErrorHandler();

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
    setResults([]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒タイムアウト

      const response = await fetch(`/api/food/search?query=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`検索エラー (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      // エラーレスポンスのチェック
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      // 結果が配列でなければエラー
      if (!Array.isArray(data)) {
        throw new Error('サーバーから不正な応答がありました');
      }
      
      setResults(data);
      
      // 結果がないときのフィードバック
      if (data.length === 0) {
        handleError(`「${query}」に一致する食品が見つかりませんでした`, '検索結果なし');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        handleError('検索がタイムアウトしました。もう一度お試しください。', '検索タイムアウト');
      } else {
        handleError(err, '食品の検索中にエラーが発生しました');
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 検索クエリをクリア
   */
  const clearSearch = () => {
    setQuery('');
    setResults([]);
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

  /**
   * Enterキーで検索
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchFood();
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <div className="w-full" ref={searchContainerRef}>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="食品名を入力して検索..."
            className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="入力をクリア"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={searchFood}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="検索"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4 text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">検索中...</span>
        </div>
      ) : (
        results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-h-96 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {results.map((food, index) => (
                <li
                  key={`${food.foodId}_${index}`}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(food)}
                >
                  <div className="font-medium text-gray-900">{food.label}</div>
                  {'originalLabel' in food && food.originalLabel && food.originalLabel !== food.label && (
                    <div className="text-xs text-gray-500 mb-1">{food.originalLabel}</div>
                  )}
                  <div className="mt-1 text-gray-600 text-sm">
                    {Math.round(food.nutrients.ENERC_KCAL)}kcal / 
                    P: {Math.round(food.nutrients.PROCNT)}g / 
                    F: {Math.round(food.nutrients.FAT)}g / 
                    C: {Math.round(food.nutrients.CHOCDF)}g
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