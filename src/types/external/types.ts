// Edamam API関連の型定義

/**
 * 食事検索結果
 */
export interface FoodSearchResult {
  foodId: string;
  label: string;
  nutrients: {
    ENERC_KCAL: number;
    PROCNT: number;
    FAT: number;
    CHOCDF: number;
  };
}

/**
 * Edamamの栄養素
 */
export interface EdamamNutrients {
  ENERC_KCAL: number;
  PROCNT: number;
  FAT: number;
  CHOCDF: number;
}

/**
 * Edamamの食品
 */
export interface EdamamFood {
  foodId: string;
  label: string;
  nutrients: EdamamNutrients;
  knownAs?: string;
}

/**
 * Edamamの測定
 */
export interface EdamamMeasure {
  uri: string;
  label: string;
  weight: number;
}

/**
 * Edamamのヒント
 */
export interface EdamamHint {
  food: EdamamFood;
  measures?: EdamamMeasure[];
}

/**
 * Edamamの解析食品
 */
export interface EdamamParsedFood {
  food: EdamamFood;
}

/**
 * Edamamのレスポンス
 */ 
export interface EdamamResponse {
  text: string;
  parsed: EdamamParsedFood[];
  hints: EdamamHint[];
} 