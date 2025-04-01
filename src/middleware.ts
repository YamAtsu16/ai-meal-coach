import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 保護されたルート
 */
const protectedPaths = [
  '/',
  '/profile',
  '/analysis',
  '/record',
  '/api/profile',
  '/api/meals',
  '/api/analysis',
];

/**
 * 認証不要のルート
 */
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
];

/**
 * ミドルウェア
 * @param request リクエスト
 * @returns レスポンス
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 認証不要のルートは処理をスキップ
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // 保護されたルートかどうかをチェック
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (isProtectedPath) {
    // Next-Auth v4 形式でのトークン取得
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // トークンがない場合はログインページにリダイレクト
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      // 元のURLをクエリパラメータとして追加
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// ミドルウェアの設定
export const config = {
  matcher: [
    // 除外するパス
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 