# データベース設計

[← 設計書トップに戻る](../README.md)

## 1. データベース概要

### 1.1 基本仕様
- **データベース**: MongoDB
- **接続方式**: MongoDB Driver for Node.js
- **認証**: MongoDB Atlas / 自己ホスト
- **文字エンコーディング**: UTF-8

### 1.2 設計原則
- **正規化**: 適度な非正規化によるパフォーマンス最適化
- **スケーラビリティ**: 水平スケーリングに対応
- **柔軟性**: スキーマレスの利点を活用
- **整合性**: アプリケーションレベルでの整合性保証

## 2. コレクション設計

### 2.1 users コレクション

#### 2.1.1 用途
ユーザーアカウント情報の管理

#### 2.1.2 スキーマ
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

#### 2.1.3 サンプルデータ
```json
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

#### 2.1.4 制約・バリデーション
- `email`: 一意制約、メール形式
- `password`: 最小8文字、ハッシュ化必須
- `name`: 必須、最小1文字

### 2.2 profiles コレクション

#### 2.2.1 用途
ユーザーの詳細プロフィール・目標設定情報の管理

#### 2.2.2 スキーマ
```typescript
interface Profile {
  _id: ObjectId;
  userId: string; // users._id への参照
  gender: 'male' | 'female' | 'other' | null;
  birthDate: string | null; // YYYY-MM-DD形式
  height: number | null; // cm
  weight: number | null; // kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | null;
  targetCalories: number | null;
  targetProtein: number | null; // g
  targetFat: number | null; // g
  targetCarbs: number | null; // g
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.2.3 サンプルデータ
```json
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "gender": "male",
  "birthDate": "1990-01-01",
  "height": 175,
  "weight": 70,
  "activityLevel": "moderately_active",
  "goal": "lose_weight",
  "targetCalories": 2000,
  "targetProtein": 120,
  "targetFat": 60,
  "targetCarbs": 200,
  "createdAt": ISODate("2024-01-15T10:35:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:35:00.000Z")
}
```

#### 2.2.4 制約・バリデーション
- `userId`: 必須、users._id への参照
- `height`: 正の数値（50-300cm）
- `weight`: 正の数値（20-500kg）
- `targetCalories`: 正の整数（500-5000kcal）

### 2.3 meals コレクション

#### 2.3.1 用途
食事記録データの管理

#### 2.3.2 スキーマ
```typescript
interface Meal {
  _id: ObjectId;
  userId: string; // users._id への参照
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  items: FoodItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'ml' | 'piece';
  caloriesPerHundredGrams: number;
  proteinPerHundredGrams: number;
  fatPerHundredGrams: number;
  carbsPerHundredGrams: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}
```

#### 2.3.3 サンプルデータ
```json
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"),
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "mealType": "breakfast",
  "date": ISODate("2024-01-15T00:00:00.000Z"),
  "items": [
    {
      "id": "item_001",
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
    },
    {
      "id": "item_002",
      "name": "鮭",
      "quantity": 80,
      "unit": "g",
      "caloriesPerHundredGrams": 139,
      "proteinPerHundredGrams": 22.3,
      "fatPerHundredGrams": 4.1,
      "carbsPerHundredGrams": 0.1,
      "totalCalories": 111.2,
      "totalProtein": 17.84,
      "totalFat": 3.28,
      "totalCarbs": 0.08
    }
  ],
  "createdAt": ISODate("2024-01-15T07:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T07:30:00.000Z")
}
```

#### 2.3.4 制約・バリデーション
- `userId`: 必須、users._id への参照
- `mealType`: 必須、定義された値のみ
- `date`: 必須、有効な日付
- `items`: 配列、最低1つの食品アイテム
- `quantity`: 正の数値
- 栄養価: 非負の数値

## 3. インデックス設計

### 3.1 パフォーマンス要件
- **検索性能**: ユーザー別データの高速取得
- **ソート性能**: 日付順ソートの最適化
- **一意性保証**: メールアドレス・ユーザーIDの重複防止

### 3.2 インデックス定義

#### 3.2.1 users コレクション
```javascript
// メールアドレスの一意制約
db.users.createIndex({ "email": 1 }, { unique: true })

// 作成日時での検索・ソート
db.users.createIndex({ "createdAt": -1 })
```

#### 3.2.2 profiles コレクション
```javascript
// ユーザーIDの一意制約
db.profiles.createIndex({ "userId": 1 }, { unique: true })

// 更新日時での検索・ソート
db.profiles.createIndex({ "updatedAt": -1 })
```

#### 3.2.3 meals コレクション
```javascript
// ユーザー別・日付順の複合インデックス（最も重要）
db.meals.createIndex({ "userId": 1, "date": -1 })

// ユーザー別・食事タイプでの検索
db.meals.createIndex({ "userId": 1, "mealType": 1 })

// 日付範囲での検索
db.meals.createIndex({ "date": -1 })

// 作成日時での検索・ソート
db.meals.createIndex({ "createdAt": -1 })
```

### 3.3 インデックス使用パターン

#### 3.3.1 よく使用されるクエリ
```javascript
// ユーザーの最新食事記録取得
db.meals.find({ "userId": "user123" }).sort({ "date": -1 }).limit(10)

// 特定日の食事記録取得
db.meals.find({ 
  "userId": "user123", 
  "date": { 
    $gte: ISODate("2024-01-15T00:00:00.000Z"),
    $lte: ISODate("2024-01-15T23:59:59.999Z")
  }
})

// 特定期間の朝食記録取得
db.meals.find({ 
  "userId": "user123", 
  "mealType": "breakfast",
  "date": { 
    $gte: ISODate("2024-01-01T00:00:00.000Z"),
    $lte: ISODate("2024-01-31T23:59:59.999Z")
  }
})
```

## 4. データ整合性

### 4.1 参照整合性
- **アプリケーションレベル**: MongoDBの参照整合性制約なし
- **外部キー管理**: アプリケーションコードで管理
- **削除時の処理**: カスケード削除の実装

#### 4.1.1 ユーザー削除時の処理
```typescript
async function deleteUser(userId: string) {
  const session = client.startSession();
  
  try {
    await session.withTransaction(async () => {
      // プロフィール削除
      await db.collection('profiles').deleteMany({ userId }, { session });
      
      // 食事記録削除
      await db.collection('meals').deleteMany({ userId }, { session });
      
      // ユーザー削除
      await db.collection('users').deleteOne({ _id: new ObjectId(userId) }, { session });
    });
  } finally {
    await session.endSession();
  }
}
```

### 4.2 データ検証

#### 4.2.1 アプリケーションレベルバリデーション
```typescript
// Zodスキーマによるバリデーション
export const mealRecordSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.enum(['g', 'ml', 'piece']),
    // ... 栄養価フィールド
  })).min(1)
});
```

## 5. パフォーマンス最適化

### 5.1 クエリ最適化
- **プロジェクション**: 必要なフィールドのみ取得
- **リミット**: 適切な件数制限
- **ソート**: インデックスを活用したソート

#### 5.1.1 最適化されたクエリ例
```javascript
// 必要なフィールドのみ取得
db.meals.find(
  { "userId": "user123" },
  { "mealType": 1, "date": 1, "items.name": 1, "items.totalCalories": 1 }
).sort({ "date": -1 }).limit(20)
```

### 5.2 集計クエリ

#### 5.2.1 日別栄養素集計
```javascript
db.meals.aggregate([
  { $match: { "userId": "user123" } },
  { $unwind: "$items" },
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
    totalCalories: { $sum: "$items.totalCalories" },
    totalProtein: { $sum: "$items.totalProtein" },
    totalFat: { $sum: "$items.totalFat" },
    totalCarbs: { $sum: "$items.totalCarbs" }
  }},
  { $sort: { "_id": -1 } }
])
```

#### 5.2.2 食事タイプ別集計
```javascript
db.meals.aggregate([
  { $match: { 
    "userId": "user123",
    "date": { 
      $gte: ISODate("2024-01-01T00:00:00.000Z"),
      $lte: ISODate("2024-01-31T23:59:59.999Z")
    }
  }},
  { $unwind: "$items" },
  { $group: {
    _id: "$mealType",
    avgCalories: { $avg: "$items.totalCalories" },
    totalMeals: { $sum: 1 }
  }}
])
```

## 6. バックアップ・復旧

### 6.1 バックアップ戦略
- **自動バックアップ**: MongoDB Atlas 自動バックアップ
- **頻度**: 日次バックアップ
- **保持期間**: 30日間
- **地理的分散**: 複数リージョンでの保存

### 6.2 復旧手順
1. **障害検知**: 監視アラートによる自動検知
2. **影響範囲確認**: データ損失範囲の特定
3. **バックアップ選択**: 適切な復旧ポイントの選択
4. **データ復旧**: MongoDB Atlas復旧機能の使用
5. **整合性確認**: データ整合性の検証

## 7. セキュリティ

### 7.1 アクセス制御
- **認証**: MongoDB認証の有効化
- **認可**: ロールベースアクセス制御（RBAC）
- **ネットワーク**: IP制限・VPC設定

### 7.2 データ暗号化
- **転送時暗号化**: TLS/SSL通信
- **保存時暗号化**: MongoDB Atlas暗号化
- **フィールドレベル暗号化**: 機密データの暗号化（将来実装）

## 8. 監視・メトリクス

### 8.1 パフォーマンス監視
- **クエリ実行時間**: 遅いクエリの検出
- **インデックス使用率**: インデックス効率の監視
- **接続数**: 同時接続数の監視

### 8.2 容量監視
- **ストレージ使用量**: データサイズの推移
- **インデックスサイズ**: インデックス容量の監視
- **成長率**: データ増加率の予測

## 9. 移行・メンテナンス

### 9.1 スキーマ変更
- **後方互換性**: 既存データとの互換性保持
- **段階的移行**: 段階的なスキーマ更新
- **バリデーション**: 移行後のデータ検証

### 9.2 データクリーンアップ
- **古いデータ削除**: 保持期間を過ぎたデータの削除
- **重複データ処理**: 重複レコードの検出・統合
- **インデックス再構築**: 定期的なインデックス最適化

---

## 関連ドキュメント

- [API設計](./api-design.md) - データベース操作API
- [セキュリティ設計](./security-design.md) - データ保護対策
- [パフォーマンス設計](./performance-design.md) - 最適化戦略

**最終更新**: 2024年1月  
**作成者**: AI Assistant
