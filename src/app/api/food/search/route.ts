/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import type {
  EdamamNutrients,
  EdamamFood,
  EdamamMeasure,
  EdamamHint,
  EdamamParsedFood,
  EdamamResponse
} from '@/lib/types';
import { translateToEnglish, translateToJapanese } from '@/lib/utils/translation';

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
    if (!label || typeof label !== 'string') {
      return '';
    }
    
    // ラベルがすでに日本語の場合はスキップ
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(label)) {
      return label;
    }
    
    // DeepL APIで翻訳
    const translatedLabel = await translateToJapanese(label);
    return translatedLabel || label;
  } catch (error) {
    console.warn('食品ラベル翻訳エラー:', { label, error: error instanceof Error ? error.message : String(error) });
    return label; // エラー時は元のラベルを返す
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
  if (!hints || !Array.isArray(hints) || hints.length === 0) {
    return [];
  }
  
  // 関連性スコアを計算
  const scoredHints = hints.map(hint => {
    if (!hint || !hint.food) return { hint, score: 0 };
    
    const label = (hint.food.knownAs || hint.food.label || '').toLowerCase();
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
    
    // 元のクエリとの一致度も考慮（日本語のまま検索していた場合など）
    const originalQueryWords = query.toLowerCase().split(/\s+/);
    for (const word of originalQueryWords) {
      if (word.length > 1 && label.includes(word.toLowerCase())) {
        score += 10;
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
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: '検索キーワードを入力してください' }, { status: 400 });
    }

    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      console.warn('Edamam API認証情報が不足しています:', { 
        EDAMAM_APP_ID: !!EDAMAM_APP_ID, 
        EDAMAM_APP_KEY: !!EDAMAM_APP_KEY 
      });
      return NextResponse.json(
        { error: 'APIの認証情報が設定されていません' },
        { status: 500 }
      );
    }

    // DeepL APIを使用して翻訳 - 翻訳に失敗しても処理を続行
    let translatedQuery = query;
    try {
      translatedQuery = await translateToEnglish(query);
    } catch (error) {
      console.warn('検索クエリの翻訳に失敗しました:', { query, error: error instanceof Error ? error.message : String(error) });
      // 翻訳に失敗しても元のクエリで検索を続行
    }
    
    // 翻訳結果が元のクエリと同じ場合で、明らかに日本語の場合はトークン化して検索
    if (translatedQuery === query && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query)) {
      // 日本語のままでは検索しにくいので、英語と仮定して検索
      console.info(`日本語クエリを元の形式で検索します: "${query}"`);
    }
        
    // 検索クエリをエンコード（日本語文字も正しく処理）
    const encodedQuery = encodeURIComponent(translatedQuery);
    const apiUrl = `${EDAMAM_API_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodedQuery}`;
    
    // EdamamのAPIリクエスト
    const response = await fetch(apiUrl, { 
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // 1時間キャッシュ
    });

    if (!response.ok) {
      throw new Error(`Edamam APIリクエストに失敗しました: ${response.status}`);
    }

    const data: EdamamResponse = await response.json();
    
    // 検索結果が空の場合は空配列を返す
    if (!data.hints || data.hints.length === 0) {
      return NextResponse.json([]);
    }
    
    // クエリとの関連性に基づいて結果をフィルタリングとソート
    const sortedHints = sortByRelevance(data.hints, query, translatedQuery);
    
    // すべてのラベルを一括で翻訳（Promise.allSettledで失敗しても続行）
    const translationPromises = sortedHints.map(async (hint) => {
      if (!hint || !hint.food) return null;
      
      const originalLabel = hint.food.knownAs || hint.food.label || '';
      let translatedLabel;
      
      try {
        translatedLabel = await translateLabel(originalLabel);
      } catch (error) {
        console.warn('ラベル翻訳エラー:', { originalLabel, error });
        translatedLabel = originalLabel;
      }
      
      return {
        foodId: hint.food.foodId || `food_${Date.now()}`,
        label: translatedLabel || originalLabel,
        originalLabel: originalLabel,
        originalQuery: query,
        nutrients: {
          ENERC_KCAL: hint.food.nutrients?.ENERC_KCAL || 0,
          PROCNT: hint.food.nutrients?.PROCNT || 0,
          FAT: hint.food.nutrients?.FAT || 0,
          CHOCDF: hint.food.nutrients?.CHOCDF || 0
        }
      };
    });
    
    // 翻訳処理が一部失敗しても全体としては成功した結果を返す
    const translationResults = await Promise.allSettled(translationPromises);
    let foods = translationResults
      .filter((result): result is PromiseFulfilledResult<{
        foodId: string;
        label: string;
        originalLabel: string;
        originalQuery: string;
        nutrients: {
          ENERC_KCAL: number;
          PROCNT: number;
          FAT: number;
          CHOCDF: number;
        }
      }> => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
    
    // 重複する食品を除去（ラベルと栄養素の値が同じものは重複とみなす）
    const uniqueFoods: typeof foods = [];
    const seen = new Set<string>();
    
    foods.forEach(food => {
      // ラベルと栄養素の値からハッシュを生成
      const hash = `${food.label}_${Math.round(food.nutrients.ENERC_KCAL)}_${Math.round(food.nutrients.PROCNT)}_${Math.round(food.nutrients.FAT)}_${Math.round(food.nutrients.CHOCDF)}`;
      
      if (!seen.has(hash)) {
        seen.add(hash);
        uniqueFoods.push(food);
      }
    });
    
    foods = uniqueFoods;

    return NextResponse.json(foods);
  } catch (error) {
    console.error('食品検索エラー:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: '食品の検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 