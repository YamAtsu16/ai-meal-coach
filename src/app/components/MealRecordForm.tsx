'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrashIcon } from '@heroicons/react/24/outline';
import { FoodSearch } from './FoodSearch';
import { useState, useEffect } from 'react';
import {
  type MealRecord,
  type FoodItem,
  type FoodSearchResult,
  type DatabaseFoodItem,
} from '@/types';
import { mealRecordSchema } from '@/types';
import { useToast } from '@/components/Toast';

/**
 * 食事記録フォームのProps
 */
interface MealRecordFormProps {
  initialData?: {
    id?: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string;
    items: DatabaseFoodItem[];
    photoUrl?: string | null;
  };
  onSuccess?: () => void;
}

/**
 * 食事記録フォームコンポーネント
 * @param initialData 初期データ
 * @param onSuccess 成功時のコールバック関数
 */
export function MealRecordForm({ initialData, onSuccess }: MealRecordFormProps) {
  const [isEditMode] = useState(Boolean(initialData?.id));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<MealRecord>({
    resolver: zodResolver(mealRecordSchema),
    defaultValues: initialData ? {
      mealType: initialData.mealType,
      date: initialData.date,
      photoUrl: initialData.photoUrl,
      items: initialData.items.map((item: DatabaseFoodItem) => {
        return {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          nutrients: {
            per100g: {
              kcal: Number(item.caloriesPerHundredGrams),
              protein: Number(item.proteinPerHundredGrams),
              fat: Number(item.fatPerHundredGrams),
              carbs: Number(item.carbsPerHundredGrams)
            },
            total: {
              kcal: Number(item.totalCalories),
              protein: Number(item.totalProtein),
              fat: Number(item.totalFat),
              carbs: Number(item.totalCarbs)
            }
          }
        };
      })
    } : {
      mealType: 'breakfast',
      items: [],
      date: new Date().toISOString().split('T')[0],
      photoUrl: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  const { showToast } = useToast();

  // 栄養価の合計を計算
  const calculateTotalNutrients = (items: FoodItem[] = []) => {
    return items.reduce((acc, item) => ({
      kcal: acc.kcal + (item.nutrients?.total?.kcal || 0),
      protein: acc.protein + (item.nutrients?.total?.protein || 0),
      fat: acc.fat + (item.nutrients?.total?.fat || 0),
      carbs: acc.carbs + (item.nutrients?.total?.carbs || 0),
    }), {
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });
  };

  const [totalNutrients, setTotalNutrients] = useState(calculateTotalNutrients(watchItems || []));

  // 栄養価の合計を更新
  useEffect(() => {
    if (watchItems) {
      setTotalNutrients(calculateTotalNutrients(watchItems));
    }
  }, [watchItems]);

  // 食品が選択された時の処理
  const handleFoodSelect = (selectedFood: FoodSearchResult) => {
    const quantity = 100; // デフォルト値

    const per100g = {
      kcal: selectedFood.nutrients.ENERC_KCAL,
      protein: selectedFood.nutrients.PROCNT,
      fat: selectedFood.nutrients.FAT,
      carbs: selectedFood.nutrients.CHOCDF
    };

    const total = {
      kcal: (per100g.kcal * quantity) / 100,
      protein: (per100g.protein * quantity) / 100,
      fat: (per100g.fat * quantity) / 100,
      carbs: (per100g.carbs * quantity) / 100
    };

    append({
      name: selectedFood.label,
      quantity: quantity,
      unit: 'g',
      nutrients: {
        per100g,
        total
      }
    });
  };

  // 数量が変更された時の処理
  const handleQuantityChange = (index: number, value: string) => {
    const newQuantity = Number(value);
    if (isNaN(newQuantity)) return;

    const item = getValues(`items.${index}`);
    if (item?.nutrients?.per100g) {
      const { per100g } = item.nutrients;
      const total = {
        kcal: (per100g.kcal * newQuantity) / 100,
        protein: (per100g.protein * newQuantity) / 100,
        fat: (per100g.fat * newQuantity) / 100,
        carbs: (per100g.carbs * newQuantity) / 100
      };

      setValue(`items.${index}.quantity`, newQuantity, { shouldDirty: true });
      setValue(`items.${index}.nutrients.total`, total, { shouldDirty: true });
    }
  };

  // 数量入力欄からフォーカスが外れた時の処理
  const handleQuantityBlur = () => {
    const items = getValues('items');
    setTotalNutrients(calculateTotalNutrients(items));
  };

  const onSubmit = async (data: MealRecord) => {
    try {
      setIsSubmitting(true);
      
      // データを変換
      const transformedItems = data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        caloriesPerHundredGrams: item.nutrients?.per100g?.kcal || 0,
        proteinPerHundredGrams: item.nutrients?.per100g?.protein || 0,
        fatPerHundredGrams: item.nutrients?.per100g?.fat || 0,
        carbsPerHundredGrams: item.nutrients?.per100g?.carbs || 0,
        totalCalories: item.nutrients?.total?.kcal || 0,
        totalProtein: item.nutrients?.total?.protein || 0,
        totalFat: item.nutrients?.total?.fat || 0,
        totalCarbs: item.nutrients?.total?.carbs || 0,
      }));

      const endpoint = isEditMode ? `/api/meals/${initialData!.id}` : '/api/meals';
      const method = isEditMode ? 'PUT' : 'POST';

      console.log(`送信先: ${endpoint}, メソッド: ${method}`);
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          items: transformedItems,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // レスポンスの生テキストを取得
        console.error('Server error - Status:', response.status);
        console.error('Server error - Response:', errorText);
        
        let errorMessage = '保存に失敗しました';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      if (!isEditMode) {
        // 新規作成時のみフォームをリセット
        reset({
          mealType: 'breakfast',
          items: [],
          date: new Date().toISOString().split('T')[0],
          photoUrl: null,
        });
      }
      
      const successMessage = isEditMode ? '食事記録を更新しました' : '食事記録を保存しました';
      showToast(successMessage, 'success');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(error instanceof Error ? error.message : '予期せぬエラーが発生しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="date" className="block text-sm font-semibold text-gray-800 mb-1">
              日付
            </label>
            <input
              type="date"
              id="date"
              {...register('date', { required: '日付を選択してください' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-800 font-medium"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <label htmlFor="mealType" className="block text-sm font-semibold text-gray-800 mb-1">
              食事タイプ
            </label>
            <select
              id="mealType"
              {...register('mealType', { required: '食事タイプを選択してください' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-800 font-medium"
            >
              <option value="breakfast">朝食</option>
              <option value="lunch">昼食</option>
              <option value="dinner">夕食</option>
              <option value="snack">間食</option>
            </select>
            {errors.mealType && (
              <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            食品を検索して追加
          </label>
          <FoodSearch onSelect={handleFoodSelect} />
        </div>

        {fields.length > 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                追加された食品
              </label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          {...register(`items.${index}.name` as const)}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 font-medium"
                        />
                      </div>
                      <div className="flex flex-row gap-4 sm:w-auto">
                        <div className="w-24 sm:w-32">
                          <input
                            type="number"
                            {...register(`items.${index}.quantity` as const, {
                              valueAsNumber: true,
                              onChange: (e) => handleQuantityChange(index, e.target.value),
                              onBlur: () => handleQuantityBlur()
                            })}
                            placeholder="量"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-500"
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </div>
                        <div className="w-20 sm:w-24">
                          <select
                            {...register(`items.${index}.unit` as const)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="個">個</option>
                            <option value="杯">杯</option>
                          </select>
                          {errors.items?.[index]?.unit && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index]?.unit?.message}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 w-full">
                      {watchItems[index]?.nutrients && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                          <div className="flex justify-between">
                            <span>カロリー:</span>
                            <span className="font-medium">{Math.round(watchItems[index].nutrients.total.kcal)}kcal</span>
                          </div>
                          <div className="flex justify-between">
                            <span>タンパク質:</span>
                            <span className="font-medium">{Math.round(watchItems[index].nutrients.total.protein)}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>脂質:</span>
                            <span className="font-medium">{Math.round(watchItems[index].nutrients.total.fat)}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>炭水化物:</span>
                            <span className="font-medium">{Math.round(watchItems[index].nutrients.total.carbs)}g</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">合計栄養価</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-blue-800">
                <div className="flex justify-between">
                  <span>カロリー:</span>
                  <span className="font-medium">{Math.round(totalNutrients.kcal)}kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>タンパク質:</span>
                  <span className="font-medium">{Math.round(totalNutrients.protein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>脂質:</span>
                  <span className="font-medium">{Math.round(totalNutrients.fat)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>炭水化物:</span>
                  <span className="font-medium">{Math.round(totalNutrients.carbs)}g</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '処理中...' : isEditMode ? '更新する' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
} 