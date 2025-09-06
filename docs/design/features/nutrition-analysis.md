# 栄養分析・AI機能

[← 設計書トップに戻る](../README.md)

## 1. 機能概要

OpenAI GPT-4o-miniを使用した食事記録の分析とパーソナライズされた栄養アドバイス生成機能です。

## 2. 主要機能

### 2.1 食事分析
- 指定日の食事記録を総合分析
- 栄養バランス評価（PFCバランス・カロリー収支）
- 食事パターンの分析

### 2.2 パーソナライズドアドバイス
- ユーザープロフィールを考慮した改善提案
- 科学的根拠に基づいた具体的な推奨事項
- 実行可能な行動計画の提示

### 2.3 分析レポート生成
- 構造化されたHTML形式での出力
- セクション別の詳細分析
- 視覚的に理解しやすい形式

## 3. 分析内容

### 3.1 基本情報分析
- **BMR（基礎代謝量）**: ハリス・ベネディクト方程式による算出
- **TDEE（総消費エネルギー）**: 活動レベルを考慮した消費カロリー
- **目標との比較**: 設定目標と実際の摂取量の差分分析
- **PFCバランス評価**: 理想的な比率との比較

### 3.2 食事内容評価
- **食事タイプ別分析**: 朝食・昼食・夕食・間食ごとの栄養バランス
- **主要栄養素評価**: カロリー・タンパク質・脂質・炭水化物の摂取量と質
- **食事パターン分析**: 食事の回数・間隔・量の分散

### 3.3 改善提案
- **栄養素調整**: 不足・過剰な栄養素の具体的な調整方法
- **食品提案**: 目標達成のための具体的な食品と量
- **行動計画**: 次の1週間で実践できる現実的な計画

### 3.4 まとめ・指標
- **良い点の評価**: 現状の食事パターンの優れた点
- **優先改善点**: 最優先で改善すべき1-2点
- **成功指標**: 具体的な目標達成の指標

## 4. 技術仕様

### 4.1 AIモデル
- **使用モデル**: GPT-4o-mini
- **API**: OpenAI API v4.89.0
- **温度設定**: 0.5（一貫性重視）
- **最大トークン数**: 2000

### 4.2 プロンプト設計
```typescript
const systemPrompt = `あなたは栄養士のアシスタントとして、科学的根拠に基づいた栄養分析とアドバイスを提供します。

【分析の目的】
ユーザーの食事記録とプロフィールデータを基に、現状を正確に把握し、健康的な食生活に向けた具体的で実行可能なアドバイスを提供すること。

【回答形式】
以下のHTMLタグを使用して、構造化された読みやすいレスポンスを作成してください：
- <section>...</section>：各セクションを囲む
- <h2>...</h2>：セクションの見出し
- <h3>...</h3>：サブセクションの見出し
- <p>...</p>：段落テキスト
- <ul>/<li>：箇条書きリスト
- <strong>...</strong>：重要なポイントの強調
- <div class="callout">...</div>：特に注目すべき情報

【回答の構成】
1. 基本情報分析
2. 食事内容の詳細評価
3. 改善提案
4. まとめ

【回答の原則】
- 科学的根拠に基づく情報のみを提供する
- 極端な制限や非現実的な提案は避ける
- 数値データ（グラム数、カロリー等）を具体的に示す
- 日本の食文化や一般的な食品に基づいたアドバイスを提供する
- 食事の楽しさと持続可能性を重視する`;
```

### 4.3 出力形式
- **フォーマット**: 構造化HTML
- **セクション分け**: 4つの主要セクション
- **スタイリング**: Tailwind CSSクラス対応

## 5. データ処理

### 5.1 入力データ
```typescript
interface AnalysisInput {
  meals: DatabaseMealRecord[];
  userProfile: UserProfileFormData | null;
  date: string;
}
```

### 5.2 栄養計算ロジック

#### BMR計算（ハリス・ベネディクト方程式）
```typescript
const calculateBMR = (
  gender: 'male' | 'female' | 'other',
  weight: number,
  height: number,
  age: number
) => {
  if (gender === 'male') {
    return Math.round(66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age));
  } else if (gender === 'female') {
    return Math.round(655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age));
  }
  return null;
};
```

#### TDEE計算
```typescript
const calculateTDEE = (bmr: number, activityLevel: string) => {
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};
```

#### 理想的なPFCバランス
```typescript
const calculateIdealPFC = (tdee: number, goal: string) => {
  switch (goal) {
    case 'lose_weight':
      return {
        protein: Math.round((tdee * 0.3) / 4), // 30%
        fat: Math.round((tdee * 0.25) / 9),    // 25%
        carbs: Math.round((tdee * 0.45) / 4)   // 45%
      };
    case 'gain_weight':
      return {
        protein: Math.round((tdee * 0.25) / 4), // 25%
        fat: Math.round((tdee * 0.25) / 9),     // 25%
        carbs: Math.round((tdee * 0.5) / 4)     // 50%
      };
    case 'maintain_weight':
    default:
      return {
        protein: Math.round((tdee * 0.2) / 4), // 20%
        fat: Math.round((tdee * 0.25) / 9),    // 25%
        carbs: Math.round((tdee * 0.55) / 4)   // 55%
      };
  }
};
```

### 5.3 食事データ集計
```typescript
const aggregateMealData = (meals: DatabaseMealRecord[]) => {
  return meals.reduce((acc, meal) => {
    const totalNutrients = meal.items?.reduce((sum, item) => ({
      calories: sum.calories + (item.totalCalories || 0),
      protein: sum.protein + (item.totalProtein || 0),
      fat: sum.fat + (item.totalFat || 0),
      carbs: sum.carbs + (item.totalCarbs || 0)
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    // 食事タイプ別集計
    if (!acc.byMealType[meal.mealType]) {
      acc.byMealType[meal.mealType] = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }
    
    acc.byMealType[meal.mealType].calories += totalNutrients.calories;
    acc.byMealType[meal.mealType].protein += totalNutrients.protein;
    acc.byMealType[meal.mealType].fat += totalNutrients.fat;
    acc.byMealType[meal.mealType].carbs += totalNutrients.carbs;

    return {
      calories: acc.calories + totalNutrients.calories,
      protein: acc.protein + totalNutrients.protein,
      fat: acc.fat + totalNutrients.fat,
      carbs: acc.carbs + totalNutrients.carbs,
      byMealType: acc.byMealType
    };
  }, { 
    calories: 0, protein: 0, fat: 0, carbs: 0, 
    byMealType: {} as Record<string, NutrientSummary>
  });
};
```

## 6. API エンドポイント

### 6.1 食事分析実行
```http
POST /api/analysis
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "date": "2024-01-15"
}
```

**レスポンス**:
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

**エラーレスポンス**:
```json
{
  "success": false,
  "message": "指定期間内の食事記録が見つかりませんでした"
}
```

## 7. エラーハンドリング

### 7.1 エラー分類
- **400 Bad Request**: 日付未指定
- **401 Unauthorized**: 認証エラー
- **404 Not Found**: 食事記録なし
- **500 Internal Server Error**: OpenAI API エラー、分析処理エラー

### 7.2 エラー処理フロー
```typescript
try {
  // OpenAI API呼び出し
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [systemMessage, userMessage],
    temperature: 0.5,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || '分析結果を生成できませんでした。';
} catch (error) {
  console.error('OpenAI API呼び出しエラー:', error);
  return 'エラーが発生しました。しばらくしてからもう一度お試しください。';
}
```

## 8. パフォーマンス最適化

### 8.1 データ取得最適化
- 必要な日付範囲のみのデータ取得
- ユーザープロフィールのキャッシュ活用
- 食事記録の効率的なフィルタリング

### 8.2 API呼び出し最適化
- プロンプトの最適化によるトークン数削減
- レスポンス時間の監視
- エラー時のフォールバック処理

## 9. 品質保証

### 9.1 分析品質の確保
- 科学的根拠に基づく栄養学知識の組み込み
- 日本の食文化に適応したアドバイス
- 実行可能で現実的な提案

### 9.2 出力品質の管理
- 構造化されたHTML出力の検証
- 一貫性のあるフォーマット
- ユーザーフレンドリーな表現

## 10. 今後の改善計画

### 10.1 機能拡張
- **長期トレンド分析**: 週間・月間の傾向分析
- **食材別分析**: 特定食材の摂取パターン分析
- **レシピ提案**: 不足栄養素を補うレシピ提案

### 10.2 精度向上
- **学習データの蓄積**: ユーザーフィードバックの活用
- **プロンプト最適化**: より精度の高いアドバイス生成
- **専門家監修**: 栄養士による内容検証

---

## 関連ドキュメント

- [食事記録管理](./meal-management.md) - 分析対象データの詳細
- [プロフィール管理](./profile-management.md) - ユーザープロフィール仕様
- [API設計](../technical/api-design.md) - API仕様の詳細

**最終更新**: 2024年1月  
**作成者**: AI Assistant
