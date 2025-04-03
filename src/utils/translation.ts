import axios from 'axios';

/**
 * 翻訳キャッシュの型定義
 */
interface TranslationCache {
  [key: string]: {
    translated: string;
    timestamp: number;
  };
}

/**
 * キャッシュの有効期限（24時間）
 */
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24時間（ミリ秒）

/**
 * 日本語から英語への翻訳キャッシュ
 */
const jaToEnCache: TranslationCache = {};

/**
 * 英語から日本語への翻訳キャッシュ
 */
const enToJaCache: TranslationCache = {};

/**
 * キャッシュから翻訳結果を取得する
 * @param text 翻訳対象のテキスト
 * @param cache キャッシュオブジェクト
 * @returns キャッシュに存在すれば翻訳結果、なければnull
 */
function getFromCache(text: string, cache: TranslationCache): string | null {
  const cacheEntry = cache[text];
  const now = Date.now();

  // キャッシュが存在し、有効期限内であれば使用
  if (cacheEntry && now - cacheEntry.timestamp < CACHE_EXPIRY) {
    return cacheEntry.translated;
  }

  // キャッシュが存在しないか期限切れ
  return null;
}

/**
 * 翻訳結果をキャッシュに保存する
 * @param text 元のテキスト
 * @param translated 翻訳されたテキスト
 * @param cache キャッシュオブジェクト
 */
function saveToCache(text: string, translated: string, cache: TranslationCache): void {
  cache[text] = {
    translated,
    timestamp: Date.now()
  };
}

/**
 * DeepL APIを使用して日本語テキストを英語に翻訳する
 * @param text 翻訳対象のテキスト
 * @returns 英語に翻訳されたテキスト
 */
export async function translateToEnglish(text: string): Promise<string> {
  try {
    // 環境変数が設定されていない場合はエラー
    if (!process.env.DEEPL_API_KEY) {
      console.error('DEEPL_API_KEYが設定されていません');
      return text; // 翻訳できないので元のテキストを返す
    }

    // キャッシュから取得を試みる
    const cachedTranslation = getFromCache(text, jaToEnCache);
    if (cachedTranslation !== null) {
      return cachedTranslation;
    }

    // DeepL APIで翻訳
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      {
        text: [text],
        target_lang: 'EN',
        source_lang: 'JA'
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.translations && response.data.translations.length > 0) {
      const translated = response.data.translations[0].text;
      
      // キャッシュに保存
      saveToCache(text, translated, jaToEnCache);
      
      return translated;
    } else {
      console.error('DeepL APIから翻訳結果が返されませんでした', response.data);
      return text; // エラー時は元のテキストを返す
    }
  } catch (error) {
    console.error('翻訳エラー:', error);
    return text; // エラー時は元のテキストを返す
  }
}

/**
 * DeepL APIを使用して英語テキストを日本語に翻訳する
 * @param text 翻訳対象のテキスト
 * @returns 日本語に翻訳されたテキスト
 */
export async function translateToJapanese(text: string): Promise<string> {
  try {
    // 環境変数が設定されていない場合はエラー
    if (!process.env.DEEPL_API_KEY) {
      console.error('DEEPL_API_KEYが設定されていません');
      return text; // 翻訳できないので元のテキストを返す
    }

    // 空のテキストや数字のみなど翻訳の必要がないものはそのまま返す
    if (!text || text.trim() === '' || /^[\d\s.]+$/.test(text)) {
      return text;
    }

    // キャッシュから取得を試みる
    const cachedTranslation = getFromCache(text, enToJaCache);
    if (cachedTranslation !== null) {
      return cachedTranslation;
    }

    // DeepL APIで翻訳
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      {
        text: [text],
        target_lang: 'JA',
        source_lang: 'EN'
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.translations && response.data.translations.length > 0) {
      const translated = response.data.translations[0].text;
      
      // キャッシュに保存
      saveToCache(text, translated, enToJaCache);
      
      return translated;
    } else {
      console.error('DeepL APIから翻訳結果が返されませんでした', response.data);
      return text; // エラー時は元のテキストを返す
    }
  } catch (error) {
    console.error('翻訳エラー:', error);
    return text; // エラー時は元のテキストを返す
  }
}