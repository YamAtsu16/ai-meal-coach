# 認証機能

[← 設計書トップに戻る](../README.md)

## 1. 機能概要

NextAuth.jsを使用したJWT認証システムにより、ユーザーの認証・認可を管理します。

## 2. 主要機能

### 2.1 ユーザー登録
- メールアドレス・パスワードでの新規アカウント作成
- パスワード強度検証
- メールアドレス重複チェック
- パスワードハッシュ化（bcryptjs）

### 2.2 ログイン・ログアウト
- 認証情報によるセッション開始
- JWT トークン生成・管理
- セッション終了処理

### 2.3 認証状態管理
- 保護されたページへのアクセス制御
- ミドルウェアによる認証チェック
- セッション有効期限管理

## 3. 技術仕様

### 3.1 認証方式
- **認証プロトコル**: JWT（JSON Web Token）
- **セッション管理**: NextAuth.js セッション
- **パスワードハッシュ**: bcryptjs（ハッシュラウンド: 12）
- **セッション有効期限**: 30日

### 3.2 セキュリティ対策
- **CSRF保護**: NextAuth.js 内蔵のCSRF保護
- **セッション固定攻撃対策**: セッションID再生成
- **ブルートフォース攻撃対策**: レート制限（将来実装）

## 4. API エンドポイント

### 4.1 ユーザー登録
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**レスポンス**:
```json
{
  "success": true,
  "message": "ユーザー登録が完了しました",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": "このメールアドレスは既に登録されています"
}
```

### 4.2 NextAuth.js 認証エンドポイント
```http
POST /api/auth/[...nextauth]
```
- NextAuth.jsが自動生成する認証エンドポイント
- ログイン・ログアウト・セッション管理を処理

### 4.3 認証状態確認
```http
GET /api/auth/check
```

**レスポンス**:
```json
{
  "authenticated": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "田中太郎",
    "email": "tanaka@example.com"
  }
}
```

## 5. データモデル

### 5.1 ユーザーモデル
```typescript
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string; // bcryptjs ハッシュ
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 セッションモデル（NextAuth.js）
```typescript
interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  expires: string;
}

interface JWT {
  id: string;
  name?: string;
  email?: string;
  iat: number;
  exp: number;
}
```

## 6. バリデーション

### 6.1 登録フォームバリデーション
```typescript
export const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});
```

### 6.2 ログインフォームバリデーション
```typescript
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});
```

## 7. 認証フロー

### 7.1 ユーザー登録フロー
```
1. ユーザーが登録フォームに入力
2. フロントエンドでバリデーション
3. POST /api/auth/register
4. サーバーサイドバリデーション
5. メールアドレス重複チェック
6. パスワードハッシュ化
7. データベースに保存
8. 成功レスポンス
9. ログインページにリダイレクト
```

### 7.2 ログインフロー
```
1. ユーザーがログインフォームに入力
2. NextAuth.js signIn() 実行
3. POST /api/auth/[...nextauth]
4. Credentials Provider で認証
5. データベースでユーザー検索
6. パスワード検証
7. JWT トークン生成
8. セッション作成
9. ホームページにリダイレクト
```

### 7.3 認証チェックフロー
```
1. 保護されたページへアクセス
2. ミドルウェアで認証チェック
3. JWT トークン検証
4. 有効な場合: ページ表示
5. 無効な場合: ログインページにリダイレクト
```

## 8. ミドルウェア設計

### 8.1 保護されたパス
```typescript
const protectedPaths = [
  '/home',
  '/profile',
  '/analysis',
  '/record',
  '/api/profile',
  '/api/meals',
  '/api/analysis',
];
```

### 8.2 認証不要のパス
```typescript
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
];
```

### 8.3 ミドルウェア処理
```typescript
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // トップページで認証済みの場合、ホームページにリダイレクト
  if (path === '/') {
    const token = await getToken({ req: request });
    if (token) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // 認証不要のルートは処理をスキップ
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // 保護されたルートの認証チェック
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (isProtectedPath) {
    const token = await getToken({ req: request });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
```

## 9. エラーハンドリング

### 9.1 認証エラー
- **401 Unauthorized**: 認証情報が無効
- **403 Forbidden**: アクセス権限なし
- **400 Bad Request**: バリデーションエラー

### 9.2 エラーメッセージ
```typescript
const authErrors = {
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  EMAIL_ALREADY_EXISTS: 'このメールアドレスは既に登録されています',
  WEAK_PASSWORD: 'パスワードは8文字以上で入力してください',
  SESSION_EXPIRED: 'セッションが期限切れです。再度ログインしてください',
};
```

## 10. セキュリティ考慮事項

### 10.1 パスワードセキュリティ
- **最小長**: 8文字以上
- **ハッシュ化**: bcryptjs（ラウンド12）
- **ソルト**: 自動生成

### 10.2 セッションセキュリティ
- **有効期限**: 30日（設定可能）
- **自動延長**: アクティブ時に延長
- **セキュアクッキー**: HTTPS環境でのみ送信

### 10.3 CSRF対策
- NextAuth.js内蔵のCSRF保護
- SameSite Cookie属性
- Origin検証

## 11. テスト

### 11.1 テスト項目
- ユーザー登録の成功・失敗パターン
- ログイン・ログアウトの動作確認
- 認証状態チェックの動作確認
- ミドルウェアの認証制御
- バリデーションエラーの処理

### 11.2 テストデータ
```typescript
const testUsers = {
  validUser: {
    name: 'テストユーザー',
    email: 'test@example.com',
    password: 'TestPassword123!'
  },
  invalidUser: {
    name: '',
    email: 'invalid-email',
    password: '123'
  }
};
```

---

## 関連ドキュメント

- [API設計](../technical/api-design.md) - API仕様の詳細
- [セキュリティ設計](../technical/security-design.md) - セキュリティ対策
- [データベース設計](../technical/database-design.md) - ユーザーデータ構造

**最終更新**: 2024年1月  
**作成者**: AI Assistant
