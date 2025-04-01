/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import type {
  EdamamNutrients,
  EdamamFood,
  EdamamMeasure,
  EdamamHint,
  EdamamParsedFood,
  EdamamResponse
} from '@/types/external';
import { translateToEnglish, translateToJapanese } from '@/lib/translation';

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_API_URL = 'https://api.edamam.com/api/food-database/v2/parser';

// 検索結果の最大数（APIの制限を避けるため）
const MAX_RESULTS = 5;

/**
 * 英語から日本語へのラベル翻訳
 * @param label 翻訳対象のラベル
 * @returns 翻訳されたラベル
 */
async function translateLabel(label: string): Promise<string> {
  try {
    // DeepL APIで翻訳
    const translatedLabel = await translateToJapanese(label);
    return translatedLabel;
  } catch (error) {
    console.error('Label translation error:', error);
    return label;
  }
}

/**
 * 検索クエリとの関連性に基づいて食品をソートする関数
 * @param hints 検索結果のヒント
 * @param query 検索クエリ
 * @param translatedQuery 翻訳された検索クエリ
 * @returns ソートされたヒント
 */
function sortByRelevance(hints: EdamamHint[], query: string, translatedQuery: string): EdamamHint[] {
  // 関連性スコアを計算
  const scoredHints = hints.map(hint => {
    const label = (hint.food.knownAs || hint.food.label).toLowerCase();
    let score = 0;
    
    // 完全一致は最高スコア
    if (label === translatedQuery.toLowerCase()) {
      score += 100;
    }
    // 部分一致
    else if (label.includes(translatedQuery.toLowerCase())) {
      score += 50;
    }
    // 単語単位での部分一致
    else {
      const words = translatedQuery.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 2 && label.includes(word)) { // 短すぎる単語は除外
          score += 25;
        }
      }
    }
    
    return { hint, score };
  });
  
  // スコア順にソート
  scoredHints.sort((a, b) => b.score - a.score);
  
  // 最大件数に制限してヒントだけを返す
  return scoredHints.slice(0, MAX_RESULTS).map(item => item.hint);
}

/**
 * 食品検索API
 * @param request リクエストオブジェクト
 * @returns レスポンスオブジェクト
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: '検索キーワードを入力してください' }, { status: 400 });
  }

  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
    console.log('Missing API credentials:', { EDAMAM_APP_ID: !!EDAMAM_APP_ID, EDAMAM_APP_KEY: !!EDAMAM_APP_KEY });
    return NextResponse.json(
      { error: 'APIの認証情報が設定されていません' },
      { status: 500 }
    );
  }

  try {
    // DeepL APIを使用して翻訳
    const translatedQuery = await translateToEnglish(query);
    
    // 翻訳結果が元のクエリと同じ場合（翻訳に失敗した場合）、空の結果を返す
    if (translatedQuery === query && !/^[a-zA-Z\s]+$/.test(query)) {
      console.log(`翻訳に失敗したため検索をスキップします: "${query}"`);
      return NextResponse.json([]);
    }
    
    console.log(`クエリの翻訳: "${query}" -> "${translatedQuery}"`);
    
    const apiUrl = `${EDAMAM_API_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(translatedQuery)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`APIリクエストに失敗しました: ${response.status}`);
    }

    const data: EdamamResponse = await response.json();
    
    // クエリとの関連性に基づいて結果をフィルタリングとソート
    const sortedHints = sortByRelevance(data.hints, query, translatedQuery);
    
    // すべてのラベルを一括で翻訳
    const foods = await Promise.all(sortedHints.map(async (hint) => {
      const originalLabel = hint.food.knownAs || hint.food.label;
      const translatedLabel = await translateLabel(originalLabel);
      
      return {
        foodId: hint.food.foodId,
        label: translatedLabel,
        originalLabel: originalLabel, // 元の英語ラベルも保持
        originalQuery: query, // 元の検索クエリを保持
        nutrients: {
          ENERC_KCAL: hint.food.nutrients.ENERC_KCAL || 0,
          PROCNT: hint.food.nutrients.PROCNT || 0,
          FAT: hint.food.nutrients.FAT || 0,
          CHOCDF: hint.food.nutrients.CHOCDF || 0
        }
      };
    }));

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json(
      { error: '食品の検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 