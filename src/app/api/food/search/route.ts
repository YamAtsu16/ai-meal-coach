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

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_API_URL = 'https://api.edamam.com/api/food-database/v2/parser';

// 日本語から英語への変換マッピング
const JA_TO_EN_MAPPING: { [key: string]: string } = {
  // 果物
  'りんご': 'apple',
  'バナナ': 'banana',
  'オレンジ': 'orange',
  'みかん': 'mandarin orange',
  'いちご': 'strawberry',
  'ぶどう': 'grape',
  'レモン': 'lemon',
  'もも': 'peach',
  'キウイ': 'kiwi',
  'メロン': 'melon',
  'すいか': 'watermelon',
  'パイナップル': 'pineapple',
  'マンゴー': 'mango',
  '梨': 'pear',
  '柿': 'persimmon',

  // 野菜
  'トマト': 'tomato',
  'きゅうり': 'cucumber',
  'なす': 'eggplant',
  'ピーマン': 'green pepper',
  'にんじん': 'carrot',
  'じゃがいも': 'potato',
  'さつまいも': 'sweet potato',
  'かぼちゃ': 'pumpkin',
  'ほうれん草': 'spinach',
  'キャベツ': 'cabbage',
  'レタス': 'lettuce',
  'たまねぎ': 'onion',
  'ねぎ': 'green onion',
  'にんにく': 'garlic',
  'しょうが': 'ginger',

  // 肉類
  '牛肉': 'beef',
  '豚肉': 'pork',
  '鶏肉': 'chicken',
  '鶏むね肉': 'chicken breast',
  '鶏もも肉': 'chicken thigh',
  'ハム': 'ham',
  'ベーコン': 'bacon',
  'ソーセージ': 'sausage',

  // 魚介類
  '魚': 'fish',
  'サーモン': 'salmon',
  'まぐろ': 'tuna',
  'さば': 'mackerel',
  'あじ': 'horse mackerel',
  'いわし': 'sardine',
  'えび': 'shrimp',
  'かに': 'crab',
  'たこ': 'octopus',
  'いか': 'squid',

  // 乳製品・卵
  '卵': 'egg',
  '牛乳': 'milk',
  'チーズ': 'cheese',
  'ヨーグルト': 'yogurt',
  'バター': 'butter',
  '生クリーム': 'heavy cream',

  // 主食・穀物
  'パン': 'bread',
  'ご飯': 'rice',
  '米': 'rice',
  'パスタ': 'pasta',
  '麺': 'noodles',
  'うどん': 'udon noodles',
  'そば': 'soba noodles',
  'ラーメン': 'ramen noodles',

  // 豆類・豆製品
  '豆腐': 'tofu',
  '納豆': 'natto',
  '枝豆': 'edamame',
  '大豆': 'soybean',

  // 調味料
  '醤油': 'soy sauce',
  'みそ': 'miso',
  'マヨネーズ': 'mayonnaise',
  'ケチャップ': 'ketchup',
  'ドレッシング': 'dressing',
  '砂糖': 'sugar',
  '塩': 'salt',
  '油': 'oil'
};

// 英語から日本語への変換マッピング
const EN_TO_JA_MAPPING: { [key: string]: string } = Object.entries(JA_TO_EN_MAPPING).reduce((acc, [ja, en]) => {
  acc[en.toLowerCase()] = ja;
  return acc;
}, {} as { [key: string]: string });

function translateToEnglish(query: string): string {
  // 完全一致で検索
  if (JA_TO_EN_MAPPING[query]) {
    return JA_TO_EN_MAPPING[query];
  }

  // 部分一致で検索
  for (const [ja, en] of Object.entries(JA_TO_EN_MAPPING)) {
    if (query.includes(ja)) {
      return en;
    }
  }

  return query;
}

function translateLabel(label: string): string {
  const lowerLabel = label.toLowerCase();
  
  // 完全一致で検索
  if (EN_TO_JA_MAPPING[lowerLabel]) {
    return EN_TO_JA_MAPPING[lowerLabel];
  }

  // 部分一致で検索
  for (const [en, ja] of Object.entries(EN_TO_JA_MAPPING)) {
    if (lowerLabel.includes(en)) {
      return ja;
    }
  }

  return label;
}

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
    const translatedQuery = translateToEnglish(query);
    const apiUrl = `${EDAMAM_API_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(translatedQuery)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`APIリクエストに失敗しました: ${response.status}`);
    }

    const data: EdamamResponse = await response.json();
    
    const foods = data.hints.map(hint => ({
      foodId: hint.food.foodId,
      label: translateLabel(hint.food.knownAs || hint.food.label),
      nutrients: {
        ENERC_KCAL: hint.food.nutrients.ENERC_KCAL || 0,
        PROCNT: hint.food.nutrients.PROCNT || 0,
        FAT: hint.food.nutrients.FAT || 0,
        CHOCDF: hint.food.nutrients.CHOCDF || 0
      }
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