'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FireIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// 仮のデータ（後でAPIから取得するように変更）
const nutritionData = [
  { name: 'タンパク質', value: 30, color: '#3B82F6' },
  { name: '脂質', value: 25, color: '#EF4444' },
  { name: '炭水化物', value: 45, color: '#10B981' },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 総摂取カロリー */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <FireIcon className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            今日の総摂取カロリー
          </h2>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">1,850</span>
          <span className="text-gray-600">kcal</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">目標: 2,000 kcal</p>
      </div>

      {/* 栄養バランス */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            栄養バランス
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nutritionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {nutritionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="space-y-4">
              {nutritionData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.value}%</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 