'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfileFormData, Nutrition } from '@/types';

/**
 * 目標比較チャートコンポーネント
 * @param totalNutrition 総栄養素
 * @param userProfile ユーザープロフィール
 * @returns 目標比較チャート
 */
export function GoalComparisonCharts({ totalNutrition, userProfile }: { 
  totalNutrition: Nutrition,
  userProfile: UserProfileFormData | null
}) {
  /**
   * 目標が設定されているかどうかを確認
   */
  const hasTargets = Boolean(
    userProfile?.targetCalories || 
    userProfile?.targetProtein || 
    userProfile?.targetFat || 
    userProfile?.targetCarbs
  );

  /**
   * 目標が設定されていない場合の表示
   */
  if (!hasTargets) {
    return (
      <div className="flex justify-center items-center h-[200px] text-gray-500">
        <div className="text-center">
          <p>目標が設定されていません</p>
          <a href="/profile" className="text-blue-500 hover:underline mt-2 inline-block">
            プロフィールページで目標を設定する
          </a>
        </div>
      </div>
    );
  }

  /**
   * 目標との比較データ
   */
  const calorieComparisonData = [
    { 
      name: 'カロリー',
      現在: Math.round(totalNutrition.kcal),
      目標: userProfile?.targetCalories || 0
    }
  ];

  /**
   * 栄養素比較データ
   */
  const nutrientComparisonData = [
    // グラフのラベルを日本語にするためにプロパティを日本語にしている
    { 
      name: 'タンパク質',
      現在: Math.round(totalNutrition.protein),
      目標: userProfile?.targetProtein || 0
    },
    { 
      name: '脂質',
      現在: Math.round(totalNutrition.fat),
      目標: userProfile?.targetFat || 0
    },
    { 
      name: '炭水化物',
      現在: Math.round(totalNutrition.carbs),
      目標: userProfile?.targetCarbs || 0
    }
  ];

  /**
   * 目標比較チャートの表示
   */
  return (
    <div className="space-y-8">
      {/* カロリー比較グラフ */}
      {userProfile?.targetCalories ? (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">カロリー</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={calorieComparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="現在" fill="#3B82F6" />
                <Bar dataKey="目標" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* 栄養素比較グラフ */}
      {(userProfile?.targetProtein || userProfile?.targetFat || userProfile?.targetCarbs) ? (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">栄養素</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={nutrientComparisonData.filter(item => item.目標 > 0)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="現在" fill="#3B82F6" />
                <Bar dataKey="目標" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
} 