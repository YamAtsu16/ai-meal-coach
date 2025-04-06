import { DatabaseMealRecord, UserProfileFormData } from '@/types';
import OpenAI from 'openai';


// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 食事記録を分析し、栄養アドバイスを生成する
 */
export async function analyzeMeals(
  meals: DatabaseMealRecord[], 
  userProfile: UserProfileFormData | null
): Promise<string> {
  try {
    // 分析用のプロンプトを作成
    const prompt = createAnalysisPrompt(meals, userProfile);
    
    // OpenAI APIを呼び出して分析を実行
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `あなたは栄養士のアシスタントとして、科学的根拠に基づいた栄養分析とアドバイスを提供します。

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
1. <section id="basic-analysis">
   <h2>基本情報分析</h2>
   - 基礎代謝量(BMR)と1日の消費カロリー(TDEE)の確認
   - 目標に対する現在の摂取栄養素の過不足評価
   - PFCバランス評価（理想的なタンパク質:脂質:炭水化物の比率との比較）
   </section>

2. <section id="meal-analysis">
   <h2>食事内容の詳細評価</h2>
   - 各食事（朝食/昼食/夕食/間食）ごとの栄養バランス
   - 主要栄養素の摂取量と質の評価
   - 食事パターンの分析（食事の回数、間隔、量の分散）
   </section>

3. <section id="improvement">
   <h2>改善提案</h2>
   - 不足/過剰な栄養素の具体的な調整方法
   - 目標達成のための具体的な食品と量の提案
   - 次の1週間で実践できる現実的な行動計画
   </section>

4. <section id="summary">
   <h2>まとめ</h2>
   - 現状の食事パターンの良い点
   - 最優先で改善すべき1-2点
   - 具体的な成功指標
   </section>

【回答の原則】
- 科学的根拠に基づく情報のみを提供する
- 極端な制限や非現実的な提案は避ける
- 数値データ（グラム数、カロリー等）を具体的に示す
- 日本の食文化や一般的な食品に基づいたアドバイスを提供する
- 食事の楽しさと持続可能性を重視する

ユーザーの目標（減量/維持/増量）と現在の食事記録に基づいて最適化されたアドバイスをHTML形式で提供してください。
マークダウン形式は使わず、指定されたHTMLタグのみを使用してください。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '分析結果を生成できませんでした。';
  } catch (error) {
    console.error('OpenAI API呼び出しエラー:', error);
    return 'エラーが発生しました。しばらくしてからもう一度お試しください。';
  }
}

/**
 * 分析用のプロンプトを作成する
 */
function createAnalysisPrompt(
  meals: DatabaseMealRecord[], 
  userProfile: UserProfileFormData | null, 
): string {

  // 基礎代謝量の計算（ハリス・ベネディクト方程式）
  const calculateBMR = (
    gender: 'male' | 'female' | 'other' | undefined,
    weight: number | null | undefined,
    height: number | null | undefined,
    birthDate: string | null | undefined
  ) => {
    if (!gender || !weight || !height || !birthDate) return null;
    
    // 年齢の計算
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // 性別に応じた基礎代謝量の計算
    if (gender === 'male') {
      return Math.round(66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age));
    } else if (gender === 'female') {
      return Math.round(655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age));
    }
    return null;
  };

  // 活動レベルに基づく消費カロリーの計算
  const calculateTDEE = (bmr: number | null, activityLevel: string | null | undefined) => {
    if (!bmr || !activityLevel) return null;
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  };

  // ユーザープロファイル情報の整形
  const bmr = calculateBMR(userProfile?.gender, userProfile?.weight, userProfile?.height, userProfile?.birthDate);
  const tdee = calculateTDEE(bmr, userProfile?.activityLevel);

  // 理想的なPFCバランスの計算
  const calculateIdealPFC = (tdee: number | null, goal: string | null | undefined) => {
    if (!tdee) return null;
    
    // 目標に応じたPFCバランスの調整
    // 一般的な推奨値をベースに、目標に応じて調整
    switch (goal) {
      case 'lose_weight':
        return {
          protein: Math.round((tdee * 0.3) / 4), // タンパク質30%（4kcal/g）
          fat: Math.round((tdee * 0.25) / 9),    // 脂質25%（9kcal/g）
          carbs: Math.round((tdee * 0.45) / 4)   // 炭水化物45%（4kcal/g）
        };
      case 'gain_weight':
        return {
          protein: Math.round((tdee * 0.25) / 4), // タンパク質25%（4kcal/g）
          fat: Math.round((tdee * 0.25) / 9),     // 脂質25%（9kcal/g）
          carbs: Math.round((tdee * 0.5) / 4)     // 炭水化物50%（4kcal/g）
        };
      case 'maintain_weight':
      default:
        return {
          protein: Math.round((tdee * 0.2) / 4), // タンパク質20%（4kcal/g）
          fat: Math.round((tdee * 0.25) / 9),    // 脂質25%（9kcal/g）
          carbs: Math.round((tdee * 0.55) / 4)   // 炭水化物55%（4kcal/g）
        };
    }
  };

  const idealPFC = calculateIdealPFC(tdee, userProfile?.goal);

  const profileInfo = userProfile ? `
【ユーザー基本情報】
• 性別: ${userProfile.gender === 'male' ? '男性' : userProfile.gender === 'female' ? '女性' : 'その他'}
• 身長: ${userProfile.height ? `${userProfile.height}cm` : '未設定'}
• 体重: ${userProfile.weight ? `${userProfile.weight}kg` : '未設定'}
• 年齢: ${userProfile.birthDate ? `${calculateAge(userProfile.birthDate)}歳` : '未設定'}
• 基礎代謝量(BMR): ${bmr ? `${bmr}kcal` : '未計算'}
• 1日の消費カロリー(TDEE): ${tdee ? `${tdee}kcal` : '未計算'}
• 活動レベル: ${getActivityLevelLabel(userProfile.activityLevel)}
• 目標: ${getGoalLabel(userProfile.goal)}

【栄養目標】
• 設定目標カロリー: ${userProfile.targetCalories ? `${userProfile.targetCalories}kcal` : '未設定'}
• 設定目標タンパク質: ${userProfile.targetProtein ? `${userProfile.targetProtein}g` : '未設定'}
• 設定目標脂質: ${userProfile.targetFat ? `${userProfile.targetFat}g` : '未設定'}
• 設定目標炭水化物: ${userProfile.targetCarbs ? `${userProfile.targetCarbs}g` : '未設定'}

【理想的なPFCバランス参考値】
• 推奨タンパク質: ${idealPFC ? `${idealPFC.protein}g (体重1kgあたり約${userProfile.weight ? Math.round(idealPFC.protein / userProfile.weight * 10) / 10 : 'X'}g)` : '未計算'}
• 推奨脂質: ${idealPFC ? `${idealPFC.fat}g` : '未計算'}
• 推奨炭水化物: ${idealPFC ? `${idealPFC.carbs}g` : '未計算'}
` : '（ユーザープロファイル情報なし）';

  // 食事記録の整形と集計
  const mealSummary = meals.reduce((acc, meal) => {
    const totalNutrients = meal.items?.reduce((sum, item) => ({
      calories: sum.calories + (item.totalCalories || 0),
      protein: sum.protein + (item.totalProtein || 0),
      fat: sum.fat + (item.totalFat || 0),
      carbs: sum.carbs + (item.totalCarbs || 0)
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    // 食事タイプごとの集計も行う
    if (!acc.byMealType[meal.mealType]) {
      acc.byMealType[meal.mealType] = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }
    
    acc.byMealType[meal.mealType].calories += (totalNutrients?.calories || 0);
    acc.byMealType[meal.mealType].protein += (totalNutrients?.protein || 0);
    acc.byMealType[meal.mealType].fat += (totalNutrients?.fat || 0);
    acc.byMealType[meal.mealType].carbs += (totalNutrients?.carbs || 0);

    return {
      calories: acc.calories + (totalNutrients?.calories || 0),
      protein: acc.protein + (totalNutrients?.protein || 0),
      fat: acc.fat + (totalNutrients?.fat || 0),
      carbs: acc.carbs + (totalNutrients?.carbs || 0),
      byMealType: acc.byMealType
    };
  }, { calories: 0, protein: 0, fat: 0, carbs: 0, byMealType: {} as Record<string, { calories: number, protein: number, fat: number, carbs: number }> });

  // PFCバランスの計算
  const calculatePFCRatio = (calories: number, protein: number, fat: number, carbs: number) => {
    if (calories === 0) return { proteinRatio: 0, fatRatio: 0, carbsRatio: 0 };
    
    const proteinCal = protein * 4;
    const fatCal = fat * 9;
    const carbsCal = carbs * 4;
    
    return {
      proteinRatio: Math.round((proteinCal / calories) * 100),
      fatRatio: Math.round((fatCal / calories) * 100),
      carbsRatio: Math.round((carbsCal / calories) * 100)
    };
  };

  const pfcRatio = calculatePFCRatio(
    mealSummary.calories, 
    mealSummary.protein, 
    mealSummary.fat, 
    mealSummary.carbs
  );

  // 食事タイプごとの集計情報
  const mealTypeInfo = Object.entries(mealSummary.byMealType).map(([type, nutrients]) => {
    const typePFC = calculatePFCRatio(
      nutrients.calories,
      nutrients.protein,
      nutrients.fat,
      nutrients.carbs
    );
    
    return `• ${getMealTypeLabel(type)}:
  - カロリー: ${Math.round(nutrients.calories)}kcal
  - タンパク質: ${Math.round(nutrients.protein)}g (${typePFC.proteinRatio}%)
  - 脂質: ${Math.round(nutrients.fat)}g (${typePFC.fatRatio}%)
  - 炭水化物: ${Math.round(nutrients.carbs)}g (${typePFC.carbsRatio}%)`;
  }).join('\n\n');

  const mealsInfo = meals.length > 0
    ? `
【食事記録サマリー】
• 総摂取カロリー: ${Math.round(mealSummary.calories)}kcal ${tdee ? `(TDEEとの差: ${Math.round(mealSummary.calories - tdee)}kcal)` : ''}
• 総タンパク質: ${Math.round(mealSummary.protein)}g (${pfcRatio.proteinRatio}%) ${userProfile?.weight ? `(体重1kgあたり約${Math.round(mealSummary.protein / userProfile.weight * 10) / 10}g)` : ''}
• 総脂質: ${Math.round(mealSummary.fat)}g (${pfcRatio.fatRatio}%)
• 総炭水化物: ${Math.round(mealSummary.carbs)}g (${pfcRatio.carbsRatio}%)

【食事タイプ別集計】
${mealTypeInfo}

【詳細な食事記録】
${meals.map(meal => {
  const date = new Date(meal.date).toLocaleDateString('ja-JP');
  const mealType = getMealTypeLabel(meal.mealType);
  const items = meal.items?.map((item) => 
    `    - ${item.name} (${item.quantity}${item.unit}): ${Math.round(item.totalCalories)}kcal、P:${Math.round(item.totalProtein)}g、F:${Math.round(item.totalFat)}g、C:${Math.round(item.totalCarbs)}g`
  ).join('\n') || '（品目なし）';

  return `• ${date} ${mealType}
${items}`;
}).join('\n\n')}`
    : '（食事記録なし）';

  // 最終的なプロンプト
  return `
以下のユーザープロフィールと食事記録に基づいて、科学的かつ実践的な栄養分析とアドバイスを提供してください。
HTMLフォーマットで構造化された回答を作成してください。

${profileInfo}

${mealsInfo}

具体的に以下の点を分析してください：
1. 現在の食事パターンの良い点と改善点
2. 目標達成に向けた具体的なアドバイス
3. 不足している栄養素と補うための具体的な食品提案`;
}

/**
 * 食事タイプのラベルを取得する
 */
function getMealTypeLabel(mealType: string): string {
  const labels: Record<string, string> = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食'
  };
  return labels[mealType] || mealType;
}

/**
 * 活動レベルのラベルを取得する
 */
function getActivityLevelLabel(activityLevel: string | null | undefined): string {
  const labels: Record<string, string> = {
    sedentary: '座り仕事が多い',
    lightly_active: '軽い運動をする',
    moderately_active: '中程度の運動をする',
    very_active: '激しい運動をする',
    extra_active: '非常に激しい運動をする'
  };
  return activityLevel ? (labels[activityLevel] || activityLevel) : '未設定';
}

/**
 * 目標のラベルを取得する
 */
function getGoalLabel(goal: string | null | undefined): string {
  const labels: Record<string, string> = {
    lose_weight: '減量',
    maintain_weight: '現状維持',
    gain_weight: '増量'
  };
  return goal ? (labels[goal] || goal) : '未設定';
}

/**
 * 生年月日から年齢を計算する
 */
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
} 