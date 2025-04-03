import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { hash } from 'bcryptjs';
import { registerSchema } from '@/types';

/**
 * ユーザー登録API
 * @param request リクエストオブジェクト
 * @returns レスポンスオブジェクト
 */
export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // スキーマ検証
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    
    // データベースに接続
    const { db } = await connectToDatabase();
    
    // メールアドレスの重複確認
    const userExists = await db.collection('users').findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: "このメールアドレスは既に登録されています" 
        },
        { status: 400 }
      );
    }
    
    // パスワードをハッシュ化
    const hashedPassword = await hash(password, 12);
    
    // ユーザーを作成
    const newUser = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: "ユーザー登録が完了しました",
      userId: newUser.insertedId.toString(),
    });
    
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "サーバーエラーが発生しました" 
      },
      { status: 500 }
    );
  }
} 