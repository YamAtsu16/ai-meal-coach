'use client';

import { useEffect, useState } from 'react';
import { FireIcon, ChartBarIcon, ClockIcon, FlagIcon } from '@heroicons/react/24/outline';
import { DatabaseMealRecord, UserProfileFormData, Nutrition } from '@/types';
import { NutritionBalanceChart } from './NutritionBalanceChart';
import { GoalComparisonCharts } from './GoalComparisonCharts';
import { MealRecordList } from './MealRecordList';

/**
 * ダッシュボードのグラフ
 * @returns ダッシュボードのグラフ
 */
export function DashboardCharts() {
  /** 食事記録 */
  const [meals, setMeals] = useState<DatabaseMealRecord[]>([]);
  /** 選択された日付 */
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  /** ローディング状態 */
  const [isLoading, setIsLoading] = useState(true);
  /** エラー */
  const [error, setError] = useState<string | null>(null);
  /** ユーザープロフィール */
  const [userProfile, setUserProfile] = useState<UserProfileFormData | null>(null);

  /**
   * 食事データの取得
   */
  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/meals', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('食事記録の取得に失敗しました');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('食事記録のデータ形式が不正です');
      }

      // MongoDBの_idをidとしてマッピング
      const mealsWithId = data.map(meal => ({
        ...meal,
        id: meal._id || meal.id
      }));

      setMeals(mealsWithId);
    } catch (error) {
      console.error('食事記録の取得エラー:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ユーザープロフィールの取得
   */
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include', // Cookieを含める
      });
      if (!response.ok) {
        console.error('プロフィールの取得に失敗しました');
        return;
      }
      const result = await response.json();
      if (result.success && result.data) {
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error('プロフィールの取得エラー:', error);
    }
  };

  /**
   * 食事記録の削除ハンドラー
   */
  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('この食事記録を削除してもよろしいですか？')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('食事記録の削除に失敗しました');
      }

      // 削除成功後、食事記録を再取得
      await fetchMeals();
    } catch (error) {
      console.error('食事記録の削除エラー:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 初回ロード時にデータを取得
   */
  useEffect(() => {
    fetchMeals();
    fetchUserProfile();
  }, []);

  /**
   * 定期的にデータを更新 (30秒ごと)
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMeals();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  /**
   * 選択された日付の食事記録をフィルタリング
   */
  const selectedDateMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    mealDate.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    
    return mealDate.getTime() === compareDate.getTime();
  });

  /**
   * 選択された日付の総栄養価を計算
   */
  const totalNutrition: Nutrition = selectedDateMeals.reduce((acc, meal) => {
    const mealTotal = meal.items?.reduce((itemAcc, item) => ({
      kcal: itemAcc.kcal + (item.totalCalories || 0),
      protein: itemAcc.protein + (item.totalProtein || 0),
      fat: itemAcc.fat + (item.totalFat || 0),
      carbs: itemAcc.carbs + (item.totalCarbs || 0),
    }), { kcal: 0, protein: 0, fat: 0, carbs: 0 }) || { kcal: 0, protein: 0, fat: 0, carbs: 0 };

    return {
      kcal: acc.kcal + mealTotal.kcal,
      protein: acc.protein + mealTotal.protein,
      fat: acc.fat + mealTotal.fat,
      carbs: acc.carbs + mealTotal.carbs,
    };
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });

  /**
   * データを更新
   */
  const handleRefresh = () => {
    fetchMeals();
    fetchUserProfile();
  };

  /**
   * 日付を変更
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  /**
   * 選択できる日付の範囲を設定（過去1ヶ月から今日まで）
   */
  const getMinDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };

  /**
   * 選択できる日付の範囲を設定（過去1ヶ月から今日まで）
   */
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  /**
   * ローディング中の表示
   */
  if (isLoading && meals.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * エラー時の表示
   */
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
        <button 
          onClick={handleRefresh}
          className="ml-4 text-red-600 underline"
        >
          再読み込み
        </button>
      </div>
    );
  }

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
   * ダッシュボードの表示
   */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={getMinDate()}
            max={getMaxDate()}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-800 font-medium text-sm min-w-[150px]"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? '更新中...' : '更新'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 総摂取カロリー */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FireIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedDate === new Date().toISOString().split('T')[0] ? '今日' : selectedDate.replace(/-/g, '/')}の総摂取カロリー
            </h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {Math.round(totalNutrition.kcal)}
            </span>
            <span className="text-gray-600">kcal</span>
            {userProfile?.targetCalories && (
              <span className="text-gray-500 ml-2">
                / 目標 {userProfile.targetCalories}kcal ({Math.round((totalNutrition.kcal / userProfile.targetCalories) * 100) || 0}%)
              </span>
            )}
          </div>
        </div>

        {/* 栄養バランス */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              栄養バランス
            </h2>
          </div>
          <NutritionBalanceChart totalNutrition={totalNutrition} />
        </div>
      </div>

      {/* 目標との比較 */}
      {hasTargets && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <FlagIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              目標との比較
            </h2>
          </div>
          <GoalComparisonCharts totalNutrition={totalNutrition} userProfile={userProfile} />
        </div>
      )}

      {/* その日の食事記録 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedDate === new Date().toISOString().split('T')[0] ? '今日' : selectedDate.replace(/-/g, '/')}の食事記録
          </h2>
        </div>
        <MealRecordList 
          selectedDateMeals={selectedDateMeals} 
          handleDeleteMeal={handleDeleteMeal}
        />
      </div>
    </div>
  );
} 