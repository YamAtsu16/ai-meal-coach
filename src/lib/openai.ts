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
          content: `あなたは栄養士のアシスタントです。
ユーザーの食事記録、身体情報、目標に基づいて、詳細な栄養分析とアドバイスを提供してください。
以下の形式で回答を構造化してください：

【基本情報分析】
• ユーザーの身体特性（性別、身長、体重、BMI）に基づく基礎代謝や必要栄養素の評価
• 現在の目標（減量/増量/維持）に対する適切性の評価
• 現在の栄養摂取目標値が適切でない場合、 現在の目標（減量/増量/維持）に対する適切な栄養摂取目標値の提示

【目標達成状況】
• 設定された栄養目標値の評価（適切か過不足があるか）
• 目標に対する現在の摂取状況の比較分析
• 目標達成のための具体的なアドバイス

【食事内容の評価】
• 提供された食事メニューの栄養バランス評価
• 主要栄養素（タンパク質、脂質、炭水化物）のバランス
• 食材の多様性評価
• 改善が必要な点の指摘

【推奨事項】
• ユーザーの目標に適した具体的な食材の提案
• 1日の食事パターンの提案
• 不足している栄養素を補うための具体的な食材や食事の提案

【まとめ】
• 全体的な評価
• 優先的に取り組むべき改善点
• 継続できている良い点

回答は箇条書きを活用し、わかりやすく構造化してください。
アドバイスは具体的で実行可能なものにしてください。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
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
  // BMIの計算
  const calculateBMI = (height: number | null | undefined, weight: number | null | undefined) => {
    if (!height || !weight) return null;
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  // 基礎代謝量の計算（ハリス・ベネディクト方程式）
  const calculateBMR = (
    gender: 'male' | 'female' | 'other' | undefined,
    weight: number | null | undefined,
    height: number | null | undefined,
    birthDate: string | null | undefined
  ) => {
    if (!gender || !weight || !height || !birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

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
  const bmi = calculateBMI(userProfile?.height, userProfile?.weight);
  const bmr = calculateBMR(userProfile?.gender, userProfile?.weight, userProfile?.height, userProfile?.birthDate);
  const tdee = calculateTDEE(bmr, userProfile?.activityLevel);

  const profileInfo = userProfile ? `
【ユーザー基本情報】
• 性別: ${userProfile.gender === 'male' ? '男性' : userProfile.gender === 'female' ? '女性' : 'その他'}
• 身長: ${userProfile.height ? `${userProfile.height}cm` : '未設定'}
• 体重: ${userProfile.weight ? `${userProfile.weight}kg` : '未設定'}
• BMI: ${bmi ? `${bmi}` : '未計算'}
• 基礎代謝量: ${bmr ? `${bmr}kcal` : '未計算'}
• 1日の消費カロリー目安: ${tdee ? `${tdee}kcal` : '未計算'}
• 活動レベル: ${getActivityLevelLabel(userProfile.activityLevel)}
• 目標: ${getGoalLabel(userProfile.goal)}

【栄養目標】
• 目標カロリー: ${userProfile.targetCalories ? `${userProfile.targetCalories}kcal` : '未設定'}
• 目標タンパク質: ${userProfile.targetProtein ? `${userProfile.targetProtein}g` : '未設定'}
• 目標脂質: ${userProfile.targetFat ? `${userProfile.targetFat}g` : '未設定'}
• 目標炭水化物: ${userProfile.targetCarbs ? `${userProfile.targetCarbs}g` : '未設定'}
` : '（ユーザープロファイル情報なし）';

  // 食事記録の整形と集計
  const mealSummary = meals.reduce((acc, meal) => {
    const totalNutrients = meal.items?.reduce((sum, item) => ({
      calories: sum.calories + (item.totalCalories || 0),
      protein: sum.protein + (item.totalProtein || 0),
      fat: sum.fat + (item.totalFat || 0),
      carbs: sum.carbs + (item.totalCarbs || 0)
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    return {
      calories: acc.calories + (totalNutrients?.calories || 0),
      protein: acc.protein + (totalNutrients?.protein || 0),
      fat: acc.fat + (totalNutrients?.fat || 0),
      carbs: acc.carbs + (totalNutrients?.carbs || 0)
    };
  }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

  const mealsInfo = meals.length > 0
    ? `
【食事記録サマリー】
• 期間: ${analysisType === 'daily' ? '1日' : '過去7日間'}
• 総摂取カロリー: ${Math.round(mealSummary.calories)}kcal
• 総タンパク質: ${Math.round(mealSummary.protein)}g
• 総脂質: ${Math.round(mealSummary.fat)}g
• 総炭水化物: ${Math.round(mealSummary.carbs)}g

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

  // 分析タイプに応じたプロンプト内容
  const analysisInstructions = analysisType === 'daily'
    ? '上記の本日の食事記録について、詳細な栄養分析とアドバイスを提供してください。'
    : '上記の週間の食事記録について、全体的な栄養バランスのパターンや傾向を分析し、改善のためのアドバイスを提供してください。';

  // 最終的なプロンプト
  return `
以下の情報に基づいて、詳細な栄養分析とアドバイスを提供してください。

${profileInfo}

${mealsInfo}

${analysisInstructions}`;
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