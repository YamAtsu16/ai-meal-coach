import OpenAI from 'openai';
import type { DatabaseMealRecord } from '@/types';
import type { UserProfileFormData } from '@/types/user';

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 食事記録を分析し、栄養アドバイスを生成する
 */
export async function analyzeMeals(
  meals: DatabaseMealRecord[], 
  userProfile: UserProfileFormData | null, 
  analysisType: 'daily' | 'weekly'
): Promise<string> {
  try {
    // 分析用のプロンプトを作成
    const prompt = createAnalysisPrompt(meals, userProfile, analysisType);
    
    // OpenAI APIを呼び出して分析を実行
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたは栄養士のアシスタントです。ユーザーの食事記録に基づいて、栄養バランスの分析と改善アドバイスを提供してください。日本語で回答してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
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
  analysisType: 'daily' | 'weekly'
): string {
  // ユーザープロファイル情報
  const getBirthDate = (birthDate: string | null | undefined) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = userProfile?.birthDate ? getBirthDate(userProfile.birthDate) : null;

  const profileInfo = userProfile ? `
    ユーザー情報：
    - 性別: ${userProfile.gender === 'male' ? '男性' : userProfile.gender === 'female' ? '女性' : 'その他'}
    - 年齢: ${age ? `${age}歳` : '未設定'}
    - 身長: ${userProfile.height ? `${userProfile.height}cm` : '未設定'}
    - 体重: ${userProfile.weight ? `${userProfile.weight}kg` : '未設定'}
    - 目標カロリー: ${userProfile.targetCalories || '未設定'}
    - 目標タンパク質: ${userProfile.targetProtein ? `${userProfile.targetProtein}g` : '未設定'}
    - 目標脂質: ${userProfile.targetFat ? `${userProfile.targetFat}g` : '未設定'}
    - 目標炭水化物: ${userProfile.targetCarbs ? `${userProfile.targetCarbs}g` : '未設定'}
  ` : '（ユーザープロファイル情報なし）';

  // 食事記録の整形
  const mealsInfo = meals.length > 0
    ? meals.map(meal => {
        const date = new Date(meal.date).toLocaleDateString('ja-JP');
        const mealType = getMealTypeLabel(meal.mealType);
        const items = meal.items?.map((item) => 
          `${item.name} (${item.quantity}${item.unit}) - ${Math.round(item.totalCalories)}kcal、タンパク質:${Math.round(item.totalProtein)}g、脂質:${Math.round(item.totalFat)}g、炭水化物:${Math.round(item.totalCarbs)}g`
        ).join('\n    ') || '（品目なし）';

        return `
    【${date} ${mealType}】
    ${items}
    `;
      }).join('\n')
    : '（食事記録なし）';

  // 分析タイプに応じたプロンプト内容
  const analysisInstructions = analysisType === 'daily'
    ? '上記の本日の食事記録について、栄養バランスを分析し、改善のためのアドバイスを提供してください。'
    : '上記の週間の食事記録について、全体的な栄養バランスのパターンや傾向を分析し、改善のためのアドバイスを提供してください。';

  // 最終的なプロンプト
  return `
以下の食事記録と目標に基づいて、栄養バランスの分析とアドバイスを提供してください。

${profileInfo}

【食事記録】
${mealsInfo}

${analysisInstructions}

具体的に以下の点について分析してください：
1. 摂取カロリーと主要栄養素（タンパク質、脂質、炭水化物）のバランス評価
2. 目標値との比較（設定されている場合）
3. 改善のための具体的なアドバイス
4. 推奨される食品や食事パターンの提案
`;
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