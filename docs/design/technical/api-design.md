# API設計

[← 設計書トップに戻る](../README.md)

## 1. API概要

### 1.1 基本仕様
- **アーキテクチャ**: RESTful API
- **認証方式**: JWT（NextAuth.js）
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8
- **HTTPSサポート**: 必須（本番環境）

### 1.2 設計原則
- **RESTful**: HTTP動詞とリソース指向設計
- **統一性**: 一貫したレスポンス形式
- **セキュリティ**: 認証・認可の徹底
- **エラーハンドリング**: 明確なエラーメッセージ

## 2. 認証API

### 2.1 ユーザー登録
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

**成功レスポンス (201 Created)**:
```json
{
  "success": true,
  "message": "ユーザー登録が完了しました",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**エラーレスポンス (400 Bad Request)**:
```json
{
  "success": false,
  "error": "このメールアドレスは既に登録されています"
}
```

### 2.2 NextAuth.js 認証エンドポイント
```http
POST /api/auth/[...nextauth]
```
- NextAuth.jsが自動生成する認証エンドポイント
- ログイン・ログアウト・セッション管理を処理

### 2.3 認証状態確認
```http
GET /api/auth/check
```

**レスポンス (200 OK)**:
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

## 3. プロフィールAPI

### 3.1 プロフィール取得
```http
GET /api/profile
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "gender": "male",
    "birthDate": "1990-01-01",
    "height": 170,
    "weight": 70,
    "activityLevel": "moderately_active",
    "goal": "lose_weight",
    "targetCalories": 2000,
    "targetProtein": 120,
    "targetFat": 60,
    "targetCarbs": 200
  }
}
```

### 3.2 プロフィール更新
```http
POST /api/profile
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "gender": "male",
  "birthDate": "1990-01-01",
  "height": 175,
  "weight": 68,
  "activityLevel": "very_active",
  "goal": "maintain_weight",
  "targetCalories": 2200,
  "targetProtein": 130,
  "targetFat": 65,
  "targetCarbs": 220
}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "gender": "male",
    "birthDate": "1990-01-01",
    "height": 175,
    "weight": 68,
    "activityLevel": "very_active",
    "goal": "maintain_weight",
    "targetCalories": 2200,
    "targetProtein": 130,
    "targetFat": 65,
    "targetCarbs": 220,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 4. 食事記録API

### 4.1 食事記録一覧取得
```http
GET /api/meals
Authorization: Bearer <JWT_TOKEN>
```

**クエリパラメータ**:
- `limit`: 取得件数（デフォルト: 50）
- `offset`: オフセット（デフォルト: 0）
- `startDate`: 開始日（YYYY-MM-DD）
- `endDate`: 終了日（YYYY-MM-DD）
- `mealType`: 食事タイプ（breakfast, lunch, dinner, snack）

**レスポンス (200 OK)**:
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "mealType": "breakfast",
    "date": "2024-01-15T00:00:00.000Z",
    "items": [
      {
        "id": "item1",
        "name": "白米",
        "quantity": 150,
        "unit": "g",
        "caloriesPerHundredGrams": 168,
        "proteinPerHundredGrams": 2.5,
        "fatPerHundredGrams": 0.3,
        "carbsPerHundredGrams": 37.1,
        "totalCalories": 252,
        "totalProtein": 3.75,
        "totalFat": 0.45,
        "totalCarbs": 55.65
      }
    ],
    "createdAt": "2024-01-15T07:30:00.000Z",
    "updatedAt": "2024-01-15T07:30:00.000Z"
  }
]
```

### 4.2 食事記録作成
```http
POST /api/meals
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "mealType": "lunch",
  "date": "2024-01-15T12:00:00.000Z",
  "items": [
    {
      "name": "鶏胸肉",
      "quantity": 100,
      "unit": "g",
      "caloriesPerHundredGrams": 191,
      "proteinPerHundredGrams": 21.3,
      "fatPerHundredGrams": 11.6,
      "carbsPerHundredGrams": 0,
      "totalCalories": 191,
      "totalProtein": 21.3,
      "totalFat": 11.6,
      "totalCarbs": 0
    }
  ]
}
```

**レスポンス (201 Created)**:
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "mealType": "lunch",
  "date": "2024-01-15T12:00:00.000Z",
  "items": [...],
  "createdAt": "2024-01-15T12:30:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z"
}
```

### 4.3 食事記録更新
```http
PUT /api/meals
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "mealType": "lunch",
  "date": "2024-01-15T12:00:00.000Z",
  "items": [...]
}
```

### 4.4 特定食事記録取得
```http
GET /api/meals/[id]
Authorization: Bearer <JWT_TOKEN>
```

### 4.5 特定食事記録更新
```http
PUT /api/meals/[id]
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "mealType": "dinner",
  "date": "2024-01-15T19:00:00.000Z",
  "items": [...]
}
```

## 5. 食品検索API

### 5.1 食品検索
```http
GET /api/food/search?query=鶏肉
```

**クエリパラメータ**:
- `query`: 検索キーワード（必須）
- `limit`: 取得件数（デフォルト: 20）

**レスポンス (200 OK)**:
```json
[
  {
    "foodId": "food_a9k0c0qb4bj3jhb9qj8j9k0l1",
    "label": "鶏胸肉",
    "originalLabel": "Chicken breast",
    "nutrients": {
      "ENERC_KCAL": 191,
      "PROCNT": 21.3,
      "FAT": 11.6,
      "CHOCDF": 0
    }
  },
  {
    "foodId": "food_b8j9d1ra5ck4kic0qk9k1m2n2",
    "label": "鶏もも肉",
    "originalLabel": "Chicken thigh",
    "nutrients": {
      "ENERC_KCAL": 204,
      "PROCNT": 16.6,
      "FAT": 14.2,
      "CHOCDF": 0
    }
  }
]
```

**エラーレスポンス (400 Bad Request)**:
```json
{
  "error": "検索キーワードを入力してください"
}
```

## 6. 栄養分析API

### 6.1 食事分析実行
```http
POST /api/analysis
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "date": "2024-01-15"
}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "mealCount": 3,
    "result": "<section id=\"basic-analysis\"><h2>基本情報分析</h2><p>本日の摂取カロリーは1,850kcalで、推定消費カロリー2,200kcalを350kcal下回っています...</p></section>",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z"
  }
}
```

**エラーレスポンス (404 Not Found)**:
```json
{
  "success": false,
  "message": "指定期間内の食事記録が見つかりませんでした"
}
```

## 7. エラーハンドリング

### 7.1 HTTPステータスコード

| コード | 意味 | 用途 |
|--------|------|------|
| 200 | OK | 成功（取得・更新） |
| 201 | Created | 成功（作成） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 認可エラー |
| 404 | Not Found | リソース未存在 |
| 500 | Internal Server Error | サーバーエラー |

### 7.2 エラーレスポンス形式

#### 7.2.1 基本形式
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "code": "ERROR_CODE"
}
```

#### 7.2.2 バリデーションエラー
```json
{
  "success": false,
  "error": "バリデーションエラー",
  "details": {
    "email": "有効なメールアドレスを入力してください",
    "password": "パスワードは8文字以上で入力してください"
  }
}
```

#### 7.2.3 認証エラー
```json
{
  "success": false,
  "error": "認証が必要です",
  "code": "AUTHENTICATION_REQUIRED"
}
```

### 7.3 エラーコード一覧

| コード | 説明 |
|--------|------|
| `VALIDATION_ERROR` | 入力値バリデーションエラー |
| `AUTHENTICATION_REQUIRED` | 認証が必要 |
| `INVALID_CREDENTIALS` | 認証情報が無効 |
| `ACCESS_DENIED` | アクセス権限なし |
| `RESOURCE_NOT_FOUND` | リソースが見つからない |
| `DUPLICATE_RESOURCE` | 重複リソース |
| `EXTERNAL_API_ERROR` | 外部API呼び出しエラー |
| `DATABASE_ERROR` | データベースエラー |
| `INTERNAL_ERROR` | 内部サーバーエラー |

## 8. レート制限

### 8.1 制限設定（将来実装）
- **一般API**: 100リクエスト/分
- **認証API**: 10リクエスト/分
- **分析API**: 20リクエスト/分

### 8.2 制限超過時のレスポンス
```json
{
  "success": false,
  "error": "レート制限を超過しました",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

## 9. APIバージョニング

### 9.1 バージョニング戦略
- **現在**: バージョニングなし（v1として扱う）
- **将来**: URLパスでのバージョニング（/api/v2/...）

### 9.2 後方互換性
- **非破壊的変更**: フィールド追加、オプションパラメータ追加
- **破壊的変更**: 新バージョンでの対応

## 10. APIドキュメント

### 10.1 OpenAPI仕様（将来実装）
- Swagger/OpenAPI 3.0での仕様記述
- 自動生成されるAPIドキュメント
- インタラクティブなAPIテスト機能

### 10.2 例外処理パターン

#### 10.2.1 外部API障害時
```typescript
try {
  const response = await fetch(externalApiUrl);
  if (!response.ok) {
    throw new Error(`External API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error('External API call failed:', error);
  return NextResponse.json(
    { success: false, error: '外部サービスとの通信に失敗しました' },
    { status: 503 }
  );
}
```

#### 10.2.2 データベース障害時
```typescript
try {
  const result = await db.collection('meals').find(query).toArray();
  return NextResponse.json(result);
} catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { success: false, error: 'データの取得に失敗しました' },
    { status: 500 }
  );
}
```

## 11. パフォーマンス最適化

### 11.1 レスポンス最適化
- **データ圧縮**: gzip圧縮の有効化
- **フィールド選択**: 必要なフィールドのみ返却
- **ページネーション**: 大量データの分割取得

### 11.2 キャッシング戦略
- **静的データ**: ブラウザキャッシュ活用
- **動的データ**: 適切なCache-Controlヘッダー
- **CDN**: 静的アセットの配信最適化

## 12. セキュリティ

### 12.1 入力値検証
- **Zodスキーマ**: 型安全なバリデーション
- **サニタイゼーション**: XSS対策
- **SQLインジェクション対策**: パラメータ化クエリ

### 12.2 認証・認可
- **JWT検証**: 全保護エンドポイントで実施
- **権限チェック**: リソースアクセス権の確認
- **セッション管理**: 適切な有効期限設定

---

## 関連ドキュメント

- [認証機能](../features/authentication.md) - 認証API詳細
- [データベース設計](./database-design.md) - データ構造
- [セキュリティ設計](./security-design.md) - セキュリティ対策

**最終更新**: 2024年1月  
**作成者**: AI Assistant
