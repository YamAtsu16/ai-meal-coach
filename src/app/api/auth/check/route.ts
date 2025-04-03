import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * 認証状態をチェックするAPI
 */
export async function GET() {
  try {
    // サーバーサイドでセッションを取得
    const session = await getServerSession(authOptions);
    
    // 認証状態を返す
    return NextResponse.json({ 
      authenticated: !!session,
      user: session?.user || null
    });
  } catch (error) {
    console.error('認証チェックエラー:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Authentication check failed' 
    }, { status: 500 });
  }
} 