# テスト設計

[← 設計書トップに戻る](../README.md)

## 1. テスト戦略

### 1.1 テスト方針
- **品質保証**: 高品質なソフトウェアの継続的な提供
- **自動化**: CI/CDパイプラインでの自動テスト実行
- **カバレッジ**: 80%以上のコードカバレッジ目標
- **継続的改善**: テスト結果に基づく品質向上

### 1.2 テストピラミッド
```
        E2E Tests
       (少数・高コスト)
      ┌─────────────┐
     │               │
    │  Integration   │
   │     Tests       │
  │   (中程度)       │
 └─────────────────┘
┌─────────────────────┐
│    Unit Tests       │
│   (多数・低コスト)    │
└─────────────────────┘
```

## 2. テスト分類

### 2.1 単体テスト（Unit Tests）
- **対象**: 個別の関数・コンポーネント・フック
- **フレームワーク**: Jest + Testing Library
- **カバレッジ目標**: 85%以上

### 2.2 統合テスト（Integration Tests）
- **対象**: API エンドポイント・データベース連携
- **フレームワーク**: Jest + Supertest
- **カバレッジ目標**: 80%以上

### 2.3 E2Eテスト（End-to-End Tests）
- **対象**: ユーザーシナリオ・ワークフロー
- **フレームワーク**: 将来実装（Playwright/Cypress）
- **カバレッジ目標**: 主要機能の100%

## 3. テスト環境

### 3.1 テスト実行環境
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

### 3.2 必要なツール・ライブラリ
- **Jest**: テストフレームワーク
- **@testing-library/react**: Reactコンポーネントテスト
- **@testing-library/jest-dom**: DOM マッチャー
- **@testing-library/user-event**: ユーザーインタラクション
- **jest-fetch-mock**: fetch API モック
- **node-mocks-http**: HTTP リクエスト・レスポンスモック

## 4. テスト対象

### 4.1 コンポーネントテスト

#### 4.1.1 ページコンポーネント（9ファイル）
| コンポーネント | テスト項目 | 重要度 |
|---------------|-----------|--------|
| ランディングページ | 認証状態別表示・リダイレクト | 高 |
| ホームページ | ダッシュボード表示・データ取得 | 高 |
| ログインページ | フォーム入力・バリデーション・認証 | 高 |
| 新規登録ページ | フォーム入力・バリデーション・登録 | 高 |
| 食事記録ページ | フォーム操作・食品検索・保存 | 高 |
| 食事記録編集ページ | 初期値設定・更新処理 | 中 |
| 栄養分析ページ | 日付選択・分析結果表示 | 高 |
| プロフィールページ | プロフィール表示・編集 | 中 |
| レイアウト | ナビゲーション・認証状態管理 | 中 |

#### 4.1.2 機能コンポーネント（11ファイル）
| コンポーネント | テスト項目 | 重要度 |
|---------------|-----------|--------|
| MealRecordForm | フォーム操作・バリデーション・送信 | 高 |
| FoodSearch | 検索機能・結果表示・選択 | 高 |
| NutritionAdvice | AI分析結果表示・ローディング | 高 |
| Navigation | メニュー表示・認証状態別UI | 中 |
| DashboardCharts | チャート表示・データ可視化 | 中 |
| その他チャート | 各種グラフ・統計表示 | 低 |

### 4.2 APIテスト（12ファイル）

#### 4.2.1 認証API
| エンドポイント | テスト項目 | 重要度 |
|---------------|-----------|--------|
| POST /api/auth/register | 登録成功・失敗・バリデーション | 高 |
| POST /api/auth/[...nextauth] | ログイン・ログアウト・セッション | 高 |
| GET /api/auth/check | 認証状態確認・トークン検証 | 高 |

#### 4.2.2 データAPI
| エンドポイント | テスト項目 | 重要度 |
|---------------|-----------|--------|
| GET/POST/PUT /api/meals | CRUD操作・認証・バリデーション | 高 |
| GET/POST /api/profile | プロフィール取得・更新 | 中 |
| POST /api/analysis | AI分析・エラーハンドリング | 高 |
| GET /api/food/search | 食品検索・外部API連携 | 中 |

### 4.3 ユーティリティテスト（2ファイル）

#### 4.3.1 OpenAI連携
```typescript
describe('OpenAI ユーティリティ', () => {
  it('食事分析を実行できること', async () => {
    const result = await analyzeMeals(mockMeals, null);
    expect(result).toContain('分析結果');
  });

  it('APIエラー時にエラーメッセージを返すこと', async () => {
    // エラー条件をモック
    const result = await analyzeMeals(mockMeals, null);
    expect(result).toContain('エラーが発生しました');
  });
});
```

#### 4.3.2 MongoDB接続
```typescript
describe('MongoDB接続', () => {
  it('データベースに接続できること', async () => {
    const { db } = await connectToDatabase();
    expect(db).toBeDefined();
    expect(db.collection).toBeDefined();
  });
});
```

### 4.4 カスタムフックテスト（1ファイル）

#### 4.4.1 useErrorHandler
```typescript
describe('useErrorHandler', () => {
  it('エラーメッセージをセットすること', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError('テストエラー');
    });
    
    expect(result.current.error).toBe('テストエラー');
    expect(mockShowToast).toHaveBeenCalledWith('テストエラー', 'error');
  });
});
```

## 5. モック戦略

### 5.1 外部API モック

#### 5.1.1 OpenAI API
```typescript
jest.mock('@/lib/utils/openai', () => ({
  analyzeMeals: jest.fn().mockResolvedValue('モック分析結果')
}));
```

#### 5.1.2 Edamam API
```typescript
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => mockFoodSearchResults
});
```

### 5.2 NextAuth.js モック
```typescript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({
    status: 'authenticated',
    data: { user: { id: 'test-user' } }
  }),
  signOut: jest.fn()
}));
```

### 5.3 データベースモック
```typescript
jest.mock('@/lib/utils/mongodb', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({
    db: {
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockData)
        })
      })
    }
  })
}));
```

## 6. テスト実行

### 6.1 コマンド
```bash
# 全テスト実行
npm test

# 監視モードでテスト実行
npm run test:watch

# カバレッジ付きテスト実行
npm run test:coverage

# 特定のテストファイル実行
npm test -- --testPathPattern=openai.test.ts
```

### 6.2 CI/CD統合
```yaml
# GitHub Actions例
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v1
```

## 7. カバレッジ目標

### 7.1 全体目標
- **ライン カバレッジ**: 80% 以上
- **関数 カバレッジ**: 85% 以上
- **ブランチ カバレッジ**: 75% 以上
- **ステートメント カバレッジ**: 80% 以上

### 7.2 分類別目標
| カテゴリ | ライン | 関数 | ブランチ |
|----------|--------|------|----------|
| API Routes | 85% | 90% | 80% |
| Components | 80% | 85% | 75% |
| Utils | 90% | 95% | 85% |
| Hooks | 85% | 90% | 80% |

## 8. テストデータ管理

### 8.1 テストデータ作成
```typescript
// テスト用ユーザーデータ
export const mockUser = {
  id: 'test-user-123',
  name: 'テストユーザー',
  email: 'test@example.com'
};

// テスト用食事記録
export const mockMealRecord = {
  id: 'meal-123',
  userId: 'test-user-123',
  mealType: 'breakfast',
  date: '2024-01-15',
  items: [
    {
      id: 'item-1',
      name: 'テスト食品',
      quantity: 100,
      unit: 'g',
      totalCalories: 100,
      totalProtein: 10,
      totalFat: 5,
      totalCarbs: 15
    }
  ]
};
```

### 8.2 テストユーティリティ
```typescript
// テスト用レンダリング関数
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </AuthProvider>
  );
}

// モック設定ヘルパー
export function setupFetchMock(responseData: any) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => responseData
  });
}
```

## 9. テスト品質管理

### 9.1 テストレビュー観点
- **テストケースの網羅性**: 正常系・異常系・境界値
- **モックの適切性**: 過度なモック化の回避
- **テストの独立性**: テスト間の依存関係排除
- **可読性**: テストコードの理解しやすさ

### 9.2 継続的改善
- **定期的なテスト見直し**: 月次でのテスト品質確認
- **フレイキーテスト対策**: 不安定なテストの特定・修正
- **パフォーマンス監視**: テスト実行時間の最適化

## 10. 今後の改善計画

### 10.1 短期改善（3ヶ月）
- **E2Eテスト導入**: Playwright/Cypressの導入
- **ビジュアルリグレッションテスト**: UI変更の自動検出
- **パフォーマンステスト**: レスポンス時間の自動測定

### 10.2 中期改善（6ヶ月）
- **テスト自動生成**: AIを活用したテストケース生成
- **クロスブラウザテスト**: 複数ブラウザでの自動テスト
- **アクセシビリティテスト**: a11yテストの自動化

---

## 関連ドキュメント

- [テスト項目表](../../test/test-matrix.md) - 全テストケースの詳細
- [API設計](../technical/api-design.md) - APIテスト仕様
- [エラーハンドリング](./error-handling.md) - エラーテスト戦略

**最終更新**: 2024年1月  
**作成者**: AI Assistant
