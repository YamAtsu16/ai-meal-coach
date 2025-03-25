import { NextRequest, NextResponse } from 'next/server';
import { UserProfileFormData } from '@/types/user';

// デモ用のモックデータ
// 実際のアプリケーションではデータベースからデータを取得する
let mockUserProfile: UserProfileFormData = {
  gender: 'male',
  birthDate: '1990-01-01',
  height: 175,
  weight: 70,
  activityLevel: 'moderately_active',
  goal: 'maintain_weight',
  targetCalories: 2000,
  targetProtein: 100,
  targetFat: 67,
  targetCarbs: 250,
};

// プロフィール取得
export async function GET() {
  try {
    // モック: データベースからユーザープロフィールを取得する代わりに
    // モックデータを返す
    return NextResponse.json({
      success: true,
      data: mockUserProfile
    });
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// プロフィール更新
export async function POST(request: NextRequest) {
  try {
    const data: UserProfileFormData = await request.json();
    
    // モック: データベースに保存する代わりにモックデータを更新
    mockUserProfile = { ...mockUserProfile, ...data };
    
    return NextResponse.json({
      success: true,
      data: mockUserProfile
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { success: false, error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }
} 