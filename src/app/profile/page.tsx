'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserProfileFormData, userProfileSchema } from '@/types';
import { useToast } from '@/providers';

/**
 * プロフィールページ
 */
export default function ProfilePage() {
  /** ローディング状態 */
  const [isLoading, setIsLoading] = useState(false);
  /** プロフィールデータのローディング状態 */
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  /** トースト表示 */
  const { showToast } = useToast();
  
  /** フォームのコントロール */
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      gender: undefined,
      birthDate: '',
      height: null,
      weight: null,
      activityLevel: undefined,
      goal: undefined,
      targetCalories: null,
      targetProtein: null,
      targetFat: null,
      targetCarbs: null,
    }
  });


  /**
   * プロフィールデータの取得
   */
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        
        if (result.success && result.data) {
          // フォームの初期値を設定
          reset(result.data);
        }
      } catch (error) {
        console.error('プロフィールデータの取得エラー:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfileData();
  }, [reset]);

  /**
   * プロフィール保存処理
   */
  const onSubmit = async (data: UserProfileFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        showToast('プロフィールが保存されました', 'success');
      } else {
        showToast('プロフィールの保存に失敗しました', 'error');
      }
    } catch (error) {
      console.error('プロフィールの保存に失敗しました', error);
      showToast('プロフィールの保存に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto p-6 flex justify-center">
          <div className="text-center">
            <p className="text-lg">プロフィールデータを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          {/* 基本情報セクション */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 性別 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                <select
                  {...register('gender')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
              </div>
              
              {/* 生年月日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
                <input
                  type="date"
                  {...register('birthDate')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>}
              </div>
              
              {/* 身長 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身長 (cm)</label>
                <input
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例: 170"
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
              </div>
              
              {/* 体重 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例: 65"
                  step="0.1"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
              </div>
            </div>
          </div>
          
          {/* 活動レベルと目標 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">活動レベルと目標</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 活動レベル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活動レベル</label>
                <select
                  {...register('activityLevel')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="sedentary">座り仕事が多い</option>
                  <option value="lightly_active">軽い運動をする</option>
                  <option value="moderately_active">中程度の運動をする</option>
                  <option value="very_active">激しい運動をする</option>
                  <option value="extra_active">非常に激しい運動をする</option>
                </select>
                {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel.message}</p>}
              </div>
              
              {/* 目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
                <select
                  {...register('goal')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="lose_weight">減量</option>
                  <option value="maintain_weight">現状維持</option>
                  <option value="gain_weight">増量</option>
                </select>
                {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>}
              </div>
            </div>
          </div>
          
          {/* 栄養目標 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">栄養目標</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 目標カロリー */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標カロリー (kcal)</label>
                <input
                  type="number"
                  {...register('targetCalories', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例: 2000"
                />
                {errors.targetCalories && <p className="text-red-500 text-sm mt-1">{errors.targetCalories.message}</p>}
              </div>
              
              {/* 目標タンパク質 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標タンパク質 (g)</label>
                <input
                  type="number"
                  {...register('targetProtein', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例: 70"
                />
                {errors.targetProtein && <p className="text-red-500 text-sm mt-1">{errors.targetProtein.message}</p>}
              </div>
              
              {/* 目標脂質 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標脂質 (g)</label>
                <input
                  type="number"
                  {...register('targetFat', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例: 60"
                />
                {errors.targetFat && <p className="text-red-500 text-sm mt-1">{errors.targetFat.message}</p>}
              </div>
              
              {/* 目標炭水化物 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標炭水化物 (g)</label>
                <input
                  type="number"
                  {...register('targetCarbs', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例: 300"
                />
                {errors.targetCarbs && <p className="text-red-500 text-sm mt-1">{errors.targetCarbs.message}</p>}
              </div>
            </div>
          </div>
          
          {/* 保存ボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 