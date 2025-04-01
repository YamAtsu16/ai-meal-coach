'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * ページネーションコンポーネントのProps
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * ページネーションコンポーネント
 * @param currentPage 現在のページ
 * @param totalPages 総ページ数
 * @param onPageChange ページ変更時のコールバック関数
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  /**
   * 表示するページ番号を制限（現在のページの前後2ページまで）
   */
  const visiblePages = pages.filter(page => {
    return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
  });

  /**
   * 省略記号（...）を追加するべき位置を特定
   */
  const pagesWithEllipsis = visiblePages.reduce((acc: (number | string)[], page, i) => {
    if (i > 0) {
      const prevPage = visiblePages[i - 1];
      if (page - prevPage > 1) {
        acc.push('...');
      }
    }
    acc.push(page);
    return acc;
  }, []);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-1" aria-label="ページネーション">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        aria-label="前のページ"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pagesWithEllipsis.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-4 py-2 text-gray-400"
            >
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === pageNumber
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-current={currentPage === pageNumber ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        aria-label="次のページ"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
} 