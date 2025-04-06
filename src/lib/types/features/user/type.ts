import { z } from "zod";
import { UserProfile } from "../profile/type";

/**
 * データベースのユーザー型
 */
export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string | null;
  profile: UserProfile | null;
}

/**
 * ログインフォームのスキーマ
 */
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

/**
 * ログインフォームのデータ型
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 登録フォームのスキーマ
 */
export const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

/**
 * 登録フォームのデータ型
 */
export type RegisterFormData = z.infer<typeof registerSchema>;