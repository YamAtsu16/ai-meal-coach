'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrashIcon } from '@heroicons/react/24/outline';
import { FoodSearch } from './FoodSearch';
import { useState, useEffect } from 'react';
import {
  mealRecordSchema,
  type MealRecord,
  type FoodItem,
  type FoodSearchResult,
  type DatabaseFoodItem,
  type MealRecordFormProps
} from '@/types';

export function MealRecordForm({ initialData, onSuccess }: MealRecordFormProps) {
  console.log('Initial data:', initialData); // デバッグ用

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
        console.log('Processing item:', item); // デバッグ用
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
      date: new Date().toISOString(),
      photoUrl: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

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
      console.log('Submitting data:', data); // デバッグログを追加

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

      console.log('Transformed items:', transformedItems); // デバッグログを追加

      const response = await fetch(initialData ? `/api/meals/${initialData.id}` : '/api/meals', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items: transformedItems,
          date: new Date().toISOString(),
        }),
      });

      console.log('Response status:', response.status); // レスポンスステータスを出力

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

      const result = await response.json();
      console.log('Saved data:', result);

      if (!initialData) {
        // 新規作成時のみフォームをリセット
        reset({
          mealType: 'breakfast',
          items: [],
          date: new Date().toISOString(),
          photoUrl: null,
        });
        alert('食事記録を保存しました');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          食事の種類
        </label>
        <select
          {...register('mealType')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          食品を検索して追加
        </label>
        <FoodSearch onSelect={handleFoodSelect} />
      </div>

      {fields.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-full">
                    {watchItems[index]?.nutrients && (
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                        <div className="flex justify-between">
                          <span>カロリー:</span>
                          <span>{Math.round(watchItems[index].nutrients.total.kcal)}kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>タンパク質:</span>
                          <span>{Math.round(watchItems[index].nutrients.total.protein)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>脂質:</span>
                          <span>{Math.round(watchItems[index].nutrients.total.fat)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>炭水化物:</span>
                          <span>{Math.round(watchItems[index].nutrients.total.carbs)}g</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">合計栄養価</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-blue-800">
              <div className="flex justify-between">
                <span>カロリー:</span>
                <span>{Math.round(totalNutrients.kcal)}kcal</span>
              </div>
              <div className="flex justify-between">
                <span>タンパク質:</span>
                <span>{Math.round(totalNutrients.protein)}g</span>
              </div>
              <div className="flex justify-between">
                <span>脂質:</span>
                <span>{Math.round(totalNutrients.fat)}g</span>
              </div>
              <div className="flex justify-between">
                <span>炭水化物:</span>
                <span>{Math.round(totalNutrients.carbs)}g</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  );
} 