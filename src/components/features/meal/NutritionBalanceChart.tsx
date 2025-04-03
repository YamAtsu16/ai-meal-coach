'use client';

import { Nutrition } from '@/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * 栄養バランス表示コンポーネント
 */
export function NutritionBalanceChart({ totalNutrition }: { totalNutrition: Nutrition }) {
  /**
   * 栄養バランスのデータを計算
   */
  const nutritionData = [
    { name: 'タンパク質', value: totalNutrition.protein * 4, color: '#3B82F6' },
    { name: '脂質', value: totalNutrition.fat * 9, color: '#EF4444' },
    { name: '炭水化物', value: totalNutrition.carbs * 4, color: '#10B981' },
  ];

  /**
   * 総カロリーが0の場合、円グラフの表示を調整
   */
  const pieData = totalNutrition.kcal > 0 
    ? nutritionData 
    : nutritionData.map(item => ({ ...item, value: item.name === 'タンパク質' ? 1 : 0 }));

  if (totalNutrition.kcal === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="w-full lg:w-1/2 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${Math.round(Number(value))} kcal`, '']} />
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
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">{Math.round(item.value)}kcal</span>
                </div>
                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${totalNutrition.kcal > 0 ? (item.value / totalNutrition.kcal) * 100 : 0}%`,
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
  );
} 