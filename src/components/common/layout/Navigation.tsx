'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';

/**
 * ナビゲーションコンポーネント
 * @returns ナビゲーションコンポーネント
 */
export function Navigation() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isOpen, setIsOpen] = useState(false);

  /**
   * メニューの開閉を切り替え
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  /**
   * メニュー項目をクリックした時の処理
   */
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  /**
   * アクティブなリンクかどうかを判定
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  /**
   * ログアウトする
   */
  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 w-full shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="font-bold text-lg sm:text-xl text-blue-600 whitespace-nowrap">
            AI Meal Coach
          </Link>

          {/* デスクトップメニュー - md以上の画面幅で表示 */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              // ログイン済みの場合のメニュー
              <>
                <Link
                  href="/home"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/home')
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <HomeIcon className="h-5 w-5 mr-1" />
                  <span>ホーム</span>
                </Link>
                <Link
                  href="/meals/new"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/meals/new')
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-1" />
                  <span>記録</span>
                </Link>
                <Link
                  href="/analysis"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/analysis')
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-1" />
                  <span>分析</span>
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/profile')
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  <span>設定</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-blue-600"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              // 未ログインの場合のメニュー
              <>
                <Link
                  href="/login"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/login')
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                  <span>ログイン</span>
                </Link>
                <Link
                  href="/register"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/register')
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  <span>新規登録</span>
                </Link>
              </>
            )}
          </div>

          {/* モバイルメニューボタン - md未満の画面幅で表示 */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none"
            onClick={toggleMenu}
            aria-expanded={isOpen}
          >
            <span className="sr-only">メニューを開く</span>
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* モバイルメニュー - 開いている時のみ表示 */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              {isAuthenticated ? (
                // ログイン済みの場合のメニュー
                <>
                  <Link
                    href="/home"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/home')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    <span>ホーム</span>
                  </Link>
                  <Link
                    href="/meals/new"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/meals/new')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    <span>記録</span>
                  </Link>
                  <Link
                    href="/analysis"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/analysis')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    <span>分析</span>
                  </Link>
                  <Link
                    href="/profile"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/profile')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    <span>設定</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    <span>ログアウト</span>
                  </button>
                </>
              ) : (
                // 未ログインの場合のメニュー
                <>
                  <Link
                    href="/login"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/login')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                    <span>ログイン</span>
                  </Link>
                  <Link
                    href="/register"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/register')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={handleMenuItemClick}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    <span>新規登録</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 