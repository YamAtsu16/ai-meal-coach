import { z } from 'zod';

/**
 * 共通の単位タイプ
 */
export type Unit = 'g' | 'ml' | '個' | '杯';

/**
 * 食事の種類
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * 栄養素のZodスキーマ
 */
export const nutritionDataSchema = z.object({
  kcal: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number()
});

/**
 * 栄養記録のZodスキーマ
 */
export const nutrientsRecordSchema = z.object({
  per100g: nutritionDataSchema,
  total: nutritionDataSchema
});

/**
 * 食品のZodスキーマ
 */
export const foodItemSchema = z.object({
  name: z.string().min(1, '食品名を入力してください'),
  quantity: z.number().min(0, '0以上の数値を入力してください'),
  unit: z.enum(['g', 'ml', '個', '杯']),
  nutrients: nutrientsRecordSchema
});

/**
 * 食事記録のZodスキーマ
 */
export const mealRecordSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  items: z.array(foodItemSchema),
  date: z.string().optional(),
});

/**
 * 栄養素の型
 */
export type Nutrition = z.infer<typeof nutritionDataSchema>;

/**
 * 栄養素記録の型
 */
export type NutrientsRecord = z.infer<typeof nutrientsRecordSchema>;

/**
 * 食品の型
 */
export type FoodItem = z.infer<typeof foodItemSchema>;

/**
 * 食事記録の型
 */
export type MealRecord = z.infer<typeof mealRecordSchema>;

/**
 * 食品情報のデータベースモデル
 */
export interface DatabaseFoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  caloriesPerHundredGrams: number;
  proteinPerHundredGrams: number;
  fatPerHundredGrams: number;
  carbsPerHundredGrams: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

/**
 * 食事記録のデータベースモデル
 */
export interface DatabaseMealRecord {
  id: string;
  mealType: MealType;
  date: string;
  items: DatabaseFoodItem[];
}

/**
 * 食品の入力型
 */ 
export type FoodItemInput = Omit<DatabaseFoodItem, 'id'>;

/**
 * 食事記録の入力型
 */
export type MealRecordInput = Omit<DatabaseMealRecord, 'id'>;