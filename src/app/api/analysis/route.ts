import { NextRequest, NextResponse } from 'next/server';
import { analyzeMeals } from '@/lib/openai';
import type { DatabaseMealRecord } from '@/types';
import type { UserProfileFormData } from '@/types/user';
import { getToken } from 'next-auth/jwt';

/**
 * 食事分析を行うAPIエンドポイント
 * POST /api/analysis
 */
export async function POST(request: NextRequest) {
  try {
    // APIキーが設定されているか確認
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    const { date, analysisType = 'daily' } = body;

    if (!date && analysisType === 'daily') {
      return NextResponse.json(
        { success: false, message: '日付が指定されていません' },
        { status: 400 }
      );
    }

    // 日付範囲の設定
    let startDate: Date, endDate: Date;
    
    if (analysisType === 'daily') {
      // 1日の分析の場合、指定された日の0時から23時59分59秒までを対象とする
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // 週間分析の場合、現在の日付から過去7日間を対象とする
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    // リクエストのオリジンを取得
    const origin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000';
    const baseUrl = origin.startsWith('http') ? origin : `http://${origin}`;

    // 認証トークン取得（next-auth/jwtを使用）
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '認証エラー' },
        { status: 401 }
      );
    }

    // ユーザープロフィールの取得（認証情報を含める）
    const profileResponse = await fetch(new URL('/api/profile', baseUrl).toString(), {
      headers: {
        Cookie: request.headers.get('cookie') || '',
        Authorization: `Bearer ${token.raw}`
      }
    });
    
    let userProfile: UserProfileFormData | null = null;
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.success && profileData.data) {
        userProfile = profileData.data;
      }
    }

    // 食事記録の取得（認証情報を含める）
    const mealsResponse = await fetch(new URL('/api/meals', baseUrl).toString(), {
      headers: {
        Cookie: request.headers.get('cookie') || '',
        Authorization: `Bearer ${token.raw}`
      }
    });
    
    let meals: DatabaseMealRecord[] = [];
    
    if (mealsResponse.ok) {
      const allMeals: DatabaseMealRecord[] = await mealsResponse.json();
      
      // 日付範囲内の食事記録をフィルタリング
      meals = allMeals.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate >= startDate && mealDate <= endDate;
      });
    } else {
      return NextResponse.json(
        { success: false, message: '食事記録の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 食事記録が存在しない場合
    if (meals.length === 0) {
      return NextResponse.json(
        { success: false, message: '指定期間内の食事記録が見つかりませんでした' },
        { status: 404 }
      );
    }

    // OpenAI APIを使用した食事分析
    const analysisResult = await analyzeMeals(meals, userProfile, analysisType);

    // 結果を返す
    return NextResponse.json({
      success: true,
      data: {
        analysisType,
        mealCount: meals.length,
        result: analysisResult,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('分析エラー:', error);
    return NextResponse.json(
      { success: false, message: '分析処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 