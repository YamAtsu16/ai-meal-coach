import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import { ObjectId } from 'mongodb';
import { MealRecordInput } from '@/types';

/**
 * 食事記録の取得
 * @param request リクエストオブジェクト
 * @returns レスポンスオブジェクト
 */
export async function GET(request: NextRequest) {
  try {
    // ユーザー情報を取得
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const userId = token.id;
    const { db } = await connectToDatabase();
    
    const meals = await db.collection('meals')
      .find({ userId: userId })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json({ error: '食事記録の取得に失敗しました' }, { status: 500 });
  }
}

/**
 * 食事記録の作成
 * @param request リクエストオブジェクト
 * @returns レスポンスオブジェクト
 */
export async function POST(request: NextRequest) {
  try {
    // ユーザー情報を取得
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const userId = token.id;
    const body = await request.json();
    const { mealType, date, items } = body as MealRecordInput;

    const { db } = await connectToDatabase();
    
    const result = await db.collection('meals').insertOne({
      userId: userId,
      mealType,
      date: new Date(date),
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const insertedMeal = await db.collection('meals').findOne({ _id: result.insertedId });
    
    return NextResponse.json(insertedMeal);
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json(
      { error: '保存に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 食事記録の更新
 * @param request リクエストオブジェクト
 * @returns レスポンスオブジェクト
 */
export async function PUT(request: NextRequest) {
  try {
    // ユーザー情報を取得
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const userId = token.id;
    const data = await request.json();
    const { id, mealType, date, items } = data;

    const { db } = await connectToDatabase();
    
    // ユーザーIDと一致する食事記録のみ更新
    const result = await db.collection('meals').findOneAndUpdate(
      { _id: new ObjectId(id), userId: userId },
      {
        $set: {
          mealType,
          date: new Date(date),
          items,
          updatedAt: new Date(),
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: '食事記録が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating meal:', error);
    return NextResponse.json(
      { error: '更新に失敗しました' },
      { status: 500 }
    );
  }
} 