'use client';

import React, { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import NutritionAdvice from '../components/NutritionAdvice';

/**
 * 栄養分析ページ
 */
export default function AnalysisPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  /**
   * 選択できる日付の範囲を設定（過去1ヶ月から今日まで）
   */
  const getMinDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };

  /**
   * 選択できる日付の最大値を設定（今日）
   */
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  /**
   * 日付選択時の処理
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">栄養分析</h1>
        </div>

        {/* 日付選択 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              分析する日付を選択
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              id="date-select"
              value={selectedDate}
              onChange={handleDateChange}
              min={getMinDate()}
              max={getMaxDate()}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              選択した日付の食事記録が分析されます
            </p>
          </div>
        </div>

        {/* 栄養アドバイスコンポーネント */}
        <NutritionAdvice selectedDate={selectedDate} />
      </main>
    </div>
  );
} 