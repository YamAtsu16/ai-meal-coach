import { z } from 'zod';

// Zodスキーマの定義
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

export const foodItemSchema = z.object({
  name: z.string().min(1, '食品名を入力してください'),
  quantity: z.number().min(0, '0以上の数値を入力してください'),
  unit: z.enum(['g', 'ml', '個', '杯']),
  nutrients: nutrientsSchema
});

export const mealRecordSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  items: z.array(foodItemSchema),
  date: z.string().optional(),
  photoUrl: z.string().nullable().optional()
});

// 型定義
export type Nutrients = {
  per100g: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  total: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

export type FoodItem = {
  name: string;
  quantity: number;
  unit: 'g' | 'ml' | '個' | '杯';
  nutrients: Nutrients;
};

export type MealRecord = z.infer<typeof mealRecordSchema>;

export interface FoodSearchResult {
  foodId: string;
  label: string;
  nutrients: {
    ENERC_KCAL: number;
    PROCNT: number;
    FAT: number;
    CHOCDF: number;
  };
}

export interface DatabaseFoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'ml' | '個' | '杯';
  caloriesPerHundredGrams: number;
  proteinPerHundredGrams: number;
  fatPerHundredGrams: number;
  carbsPerHundredGrams: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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

// APIのリクエスト/レスポンス型
export type FoodItemInput = Omit<DatabaseFoodItem, 'id'>;

export interface DatabaseMealRecord {
  id: string;
  mealType: MealType;
  date: string;
  photoUrl: string | null;
  items: DatabaseFoodItem[];
}

// ページコンポーネントのProps型
export interface EditMealRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}

// APIのレスポンス型
export interface EdamamNutrients {
  ENERC_KCAL: number;
  PROCNT: number;
  FAT: number;
  CHOCDF: number;
}

export interface EdamamFood {
  foodId: string;
  label: string;
  nutrients: EdamamNutrients;
  knownAs?: string;
}

export interface EdamamMeasure {
  uri: string;
  label: string;
  weight: number;
}

export interface EdamamHint {
  food: EdamamFood;
  measures?: EdamamMeasure[];
}

export interface EdamamParsedFood {
  food: EdamamFood;
}

export interface EdamamResponse {
  text: string;
  parsed: EdamamParsedFood[];
  hints: EdamamHint[];
}

// コンポーネントのProps型
export interface MealListProps {
  meals: DatabaseMealRecord[];
  onDelete: (id: string) => void;
} 