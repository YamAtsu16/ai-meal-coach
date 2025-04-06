import { NextRequest, NextResponse } from 'next/server';
import { UserProfileFormData } from '@/lib/types';
import { connectToDatabase } from '@/lib/utils/mongodb';
import { getServerSession } from 'next-auth';

/**
 * プロフィール取得
 * @returns レスポンスオブジェクト
 */
export async function GET() {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    // データベースに接続
    const { db } = await connectToDatabase();
    
    // ユーザーを検索
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // ユーザープロフィールを検索
    const profile = await db.collection('profiles').findOne({ userId: user._id.toString() });
    
    if (!profile) {
      // プロフィールがない場合は空のデータを返す
      return NextResponse.json({
        success: true,
        data: {
          gender: undefined,
          birthDate: '',
          height: null,
          weight: null,
          activityLevel: undefined,
          goal: undefined,
          targetCalories: null,
          targetProtein: null,
          targetFat: null,
          targetCarbs: null,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * プロフィール更新
 * @param request リクエストオブジェクト
 * @returns レスポンスオブジェクト
 */
export async function POST(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const data: UserProfileFormData = await request.json();
    
    // データベースに接続
    const { db } = await connectToDatabase();
    
    // ユーザーを検索
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 現在の日時
    const now = new Date();
    
    // プロフィールを検索し、存在すれば更新、なければ作成
    await db.collection('profiles').updateOne(
      { userId: user._id.toString() },
      {
        $set: {
          ...data,
          userId: user._id.toString(),
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );

    // 更新後のプロフィール取得
    const updatedProfile = await db.collection('profiles').findOne({ userId: user._id.toString() });
    
    return NextResponse.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { success: false, error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }
} 