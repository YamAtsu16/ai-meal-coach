import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { DashboardCharts } from './components/DashboardCharts';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ダッシュボード
          </h1>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <SparklesIcon className="w-5 h-5" />
              <span>食事を記録</span>
            </button>
          </div>
        </div>
        
        <DashboardCharts />

        {/* 最近の食事記録 */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">最近の食事記録</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              すべて表示
            </button>
          </div>
          <div className="space-y-4">
            {/* 後で実装：食事記録リスト */}
            <p className="text-gray-600">食事記録を実装予定</p>
          </div>
        </div>
      </main>
    </div>
  );
}
