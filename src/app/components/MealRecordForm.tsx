'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CameraIcon, PlusIcon } from '@heroicons/react/24/outline';

const MEAL_TYPES = [
  { id: 'breakfast', label: '朝食' },
  { id: 'lunch', label: '昼食' },
  { id: 'dinner', label: '夕食' },
  { id: 'snack', label: '間食' },
] as const;

// バリデーションスキーマ
const mealRecordSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    required_error: '食事タイプを選択してください',
  }),
  foodItems: z.array(
    z.object({
      name: z.string().min(1, '食品名を入力してください'),
      quantity: z.string().min(1, '量を入力してください'),
      unit: z.enum(['g', 'ml', '個', '杯'], {
        required_error: '単位を選択してください',
      }),
    })
  ).min(1, '少なくとも1つの食品を入力してください'),
});

type MealRecordSchema = z.infer<typeof mealRecordSchema>;

export function MealRecordForm() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<MealRecordSchema>({
    resolver: zodResolver(mealRecordSchema),
    defaultValues: {
      mealType: undefined,
      foodItems: [{ name: '', quantity: '', unit: 'g' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'foodItems',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: MealRecordSchema) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // 写真のアップロード処理は後で実装
      const formData = {
        mealType: data.mealType,
        date: new Date().toISOString(),
        items: data.foodItems.map(item => ({
          name: item.name,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
        })),
        photoUrl: null, // 写真アップロード機能実装後に更新
      };

      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('食事記録の保存に失敗しました');
      }

      setSubmitSuccess(true);
      reset(); // フォームをリセット
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMealType = watch('mealType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          食事記録を保存しました
        </div>
      )}

      {/* 食事タイプの選択 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          食事タイプ
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MEAL_TYPES.map(({ id, label }) => (
            <label
              key={id}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${selectedMealType === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <input
                type="radio"
                {...register('mealType')}
                value={id}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        {errors.mealType && (
          <p className="text-sm text-red-600 mt-1">{errors.mealType.message}</p>
        )}
      </div>

      {/* 写真アップロード */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          写真
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <CameraIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    クリックして写真をアップロード
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
        </div>
      </div>

      {/* 食品リスト */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          食品リスト
        </label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="食品名"
                {...register(`foodItems.${index}.name`)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.foodItems?.[index]?.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.foodItems[index]?.name?.message}
                </p>
              )}
            </div>
            <div className="w-20">
              <input
                type="text"
                placeholder="量"
                {...register(`foodItems.${index}.quantity`)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.foodItems?.[index]?.quantity && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.foodItems[index]?.quantity?.message}
                </p>
              )}
            </div>
            <div className="w-20">
              <select
                {...register(`foodItems.${index}.unit`)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="個">個</option>
                <option value="杯">杯</option>
              </select>
              {errors.foodItems?.[index]?.unit && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.foodItems[index]?.unit?.message}
                </p>
              )}
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: '', quantity: '', unit: 'g' })}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>食品を追加</span>
        </button>
        {errors.foodItems && !Array.isArray(errors.foodItems) && (
          <p className="text-sm text-red-600 mt-1">{errors.foodItems.message}</p>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSubmitting ? '保存中...' : '記録を保存'}
        </button>
      </div>
    </form>
  );
} 