'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';

export function Navigation() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // アクティブなリンクかどうかを判定
  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 md:top-0 md:bottom-auto md:border-t-0 md:border-b w-full">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-lg sm:text-xl text-blue-600 whitespace-nowrap">
            AI食事コーチ
          </Link>

          <div className="fixed bottom-0 left-0 right-0 w-full md:static md:w-auto">
            <div className="flex justify-around md:justify-end md:space-x-4 bg-white py-2 md:py-0">
              {isAuthenticated ? (
                // ログイン済みの場合のメニュー
                <>
                  <Link
                    href="/"
                    className={`flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                      isActive('/') || isActive('/')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <HomeIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">ホーム</span>
                  </Link>
                  <Link
                    href="/record"
                    className={`flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                      isActive('/record')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">記録</span>
                  </Link>
                  <Link
                    href="/analysis"
                    className={`flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                      isActive('/analysis')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ChartBarIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">分析</span>
                  </Link>
                  <Link
                    href="/profile"
                    className={`flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                      isActive('/profile')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <UserIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">設定</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-500 hover:text-blue-600"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">ログアウト</span>
                  </button>
                </>
              ) : (
                // 未ログインの場合のメニュー
                <>
                  <Link
                    href="/login"
                    className={`flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                      isActive('/login')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">ログイン</span>
                  </Link>
                  <Link
                    href="/register"
                    className={`flex flex-col md:flex-row items-center px-1 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                      isActive('/register')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <UserIcon className="h-5 w-5 md:h-6 md:w-6 md:mr-1" />
                    <span className="mt-1 md:mt-0">新規登録</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 