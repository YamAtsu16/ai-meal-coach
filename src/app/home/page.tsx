'use client';

import { DashboardCharts } from '../components/DashboardCharts';
import { MealHistory } from '../components/MealHistory';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <Link
            href="/meals/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            記録する
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">栄養摂取状況</h2>
            <DashboardCharts />
          </div>

          <div>
            <MealHistory />
          </div>
        </div>
      </div>
    </div>
  );
} 