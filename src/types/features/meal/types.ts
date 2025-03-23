import { z } from 'zod';
import { MealType, Unit } from '../../common/base';

/**
 * 栄養素のZodスキーマ
 */
export const nutrientsSchema = z.object({
  per100g: z.object({
    kcal: z.number(),
    protein: z.number(),
    fat: z.number(),
    carbs: z.number()
  }),
  total: z.object({
    kcal: z.number(),
    protein: z.number(),
    fat: z.number(),
    carbs: z.number()
  })
});

/**
 * 食品のZodスキーマ
 */
export const foodItemSchema = z.object({
  name: z.string().min(1, '食品名を入力してください'),
  quantity: z.number().min(0, '0以上の数値を入力してください'),
  unit: z.enum(['g', 'ml', '個', '杯']),
  nutrients: nutrientsSchema
});

/**
 * 食事記録のZodスキーマ
 */
export const mealRecordSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  items: z.array(foodItemSchema),
  date: z.string().optional(),
  photoUrl: z.string().nullable().optional()
});

/**
 * 栄養素の型
 */
export type Nutrients = z.infer<typeof nutrientsSchema>;

/**
 * 食品の型
 */
export type FoodItem = z.infer<typeof foodItemSchema>;

/**
 * 食事記録の型
 */
export type MealRecord = z.infer<typeof mealRecordSchema>;

/**
 * データベースモデル
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
  photoUrl: string | null;
  items: DatabaseFoodItem[];
}

/**
 * 食品の入力型
 */ 
export type FoodItemInput = Omit<DatabaseFoodItem, 'id'>;

/**
 * コンポーネントProps
 */
export interface MealRecordFormProps {
  initialData?: {
    id: string;
    mealType: MealType;
    date: string;
    photoUrl: string | null;
    items: DatabaseFoodItem[];
  };
  onSuccess?: () => void;
}

/**
 * 編集ページのProps
 */
export interface EditMealRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 食事リストのProps
 */ 
export interface MealListProps {
  meals: DatabaseMealRecord[];
  onDelete: (id: string) => void;
} 