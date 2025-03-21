'use client';

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';

// 仮のデータ（後でAPIから取得するように変更）
const nutritionData = [
  { name: 'タンパク質', value: 30, color: '#3B82F6' },
  { name: '脂質', value: 25, color: '#EF4444' },
  { name: '炭水化物', value: 45, color: '#10B981' },
];

const calorieHistory = [
  { date: '5/1', calories: 2100 },
  { date: '5/2', calories: 1950 },
  { date: '5/3', calories: 2200 },
  { date: '5/4', calories: 1850 },
  { date: '5/5', calories: 2000 },
  { date: '5/6', calories: 1900 },
  { date: '5/7', calories: 2150 },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div className="h-[200px]">
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
        <div className="flex justify-center gap-4 mt-4">
          {nutritionData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* カロリー推移 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            カロリー推移
          </h2>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calorieHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 