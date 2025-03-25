import { z } from 'zod';

// Gender (性別)
export const GenderEnum = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof GenderEnum>;

// Activity Level (活動レベル)
export const ActivityLevelEnum = z.enum([
  'sedentary',           // 座り仕事が多い
  'lightly_active',      // 軽い運動をする
  'moderately_active',   // 中程度の運動をする
  'very_active',         // 激しい運動をする
  'extra_active'         // 非常に激しい運動をする
]);
export type ActivityLevel = z.infer<typeof ActivityLevelEnum>;

// Goal (目標)
export const GoalEnum = z.enum([
  'lose_weight',       // 減量
  'maintain_weight',   // 現状維持
  'gain_weight'        // 増量
]);
export type Goal = z.infer<typeof GoalEnum>;

// ユーザープロフィールのバリデーションスキーマ
export const userProfileSchema = z.object({
  gender: GenderEnum.optional(),
  birthDate: z.string().optional().nullable(),
  height: z.number().positive('身長は0より大きい値を入力してください').optional().nullable(),
  weight: z.number().positive('体重は0より大きい値を入力してください').optional().nullable(),
  activityLevel: ActivityLevelEnum.optional().nullable(),
  goal: GoalEnum.optional().nullable(),
  targetCalories: z.number().int().min(500, '目標カロリーは500以上を入力してください').optional().nullable(),
  targetProtein: z.number().int().min(0, '目標タンパク質は0以上を入力してください').optional().nullable(),
  targetFat: z.number().int().min(0, '目標脂質は0以上を入力してください').optional().nullable(),
  targetCarbs: z.number().int().min(0, '目標炭水化物は0以上を入力してください').optional().nullable(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// データベースのユーザープロファイル型
export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  gender: Gender | null;
  birthDate: string | null;
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  targetCalories: number | null;
  targetProtein: number | null;
  targetFat: number | null;
  targetCarbs: number | null;
  userId: string;
}

// データベースのユーザー型
export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string | null;
  profile: UserProfile | null;
} 