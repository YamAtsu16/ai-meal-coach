'use client';

import { 
  HomeIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'ホーム', href: '/', icon: HomeIcon },
  { name: '記録', href: '/record', icon: PlusCircleIcon },
  { name: '分析', href: '/analysis', icon: ChartBarIcon },
  { name: 'プロフィール', href: '/profile', icon: UserCircleIcon },
  { name: '設定', href: '/settings', icon: Cog6ToothIcon },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ（md以上で表示） */}
          <div className="hidden md:flex items-center">
            <span className="text-xl font-bold text-blue-600">AI食事管理</span>
          </div>

          {/* ナビゲーションリンク */}
          <div className="flex justify-around md:justify-center w-full md:w-auto md:space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-3 py-2 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                  <item.icon 
                    className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
                    aria-hidden="true" 
                  />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* 右側のスペース（バランス用） */}
          <div className="hidden md:block w-40" />
        </div>
      </div>
    </nav>
  );
} 