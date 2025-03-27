import axios from 'axios';

// 翻訳結果をキャッシュするためのオブジェクト
// メモリキャッシュとして実装
interface TranslationCache {
  [key: string]: {
    translated: string;
    timestamp: number;
  };
}

// 翻訳キャッシュ（サーバー再起動時にリセットされる）
// 方向ごとにキャッシュを分ける
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24時間（ミリ秒）
const jaToEnCache: TranslationCache = {};
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
    // キャッシュヒットをログ
    console.log(`Translation cache hit: "${text}" -> "${cacheEntry.translated}"`);
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

/**
 * 複数のテキストを一括で日本語に翻訳する
 * @param texts 翻訳対象のテキスト配列
 * @returns 日本語に翻訳されたテキスト配列
 */
export async function translateMultipleToJapanese(texts: string[]): Promise<string[]> {
  try {
    // 空の配列や環境変数がない場合はそのまま返す
    if (!texts.length || !process.env.DEEPL_API_KEY) {
      return texts;
    }

    // 翻訳が必要ないテキストをフィルタリングし、すでにキャッシュにあるものを除外
    const uncachedTexts: string[] = [];
    const cachedResults: { [key: string]: string } = {};
    
    texts.forEach(text => {
      if (!text || text.trim() === '' || /^[\d\s.]+$/.test(text)) {
        // 翻訳不要なテキスト
        cachedResults[text] = text;
      } else {
        // キャッシュから取得を試みる
        const cachedTranslation = getFromCache(text, enToJaCache);
        if (cachedTranslation !== null) {
          cachedResults[text] = cachedTranslation;
        } else {
          uncachedTexts.push(text);
        }
      }
    });

    // 未キャッシュのテキストがなければ結果を返す
    if (uncachedTexts.length === 0) {
      return texts.map(text => cachedResults[text] || text);
    }

    // DeepL APIで未キャッシュのテキストを一括翻訳
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      {
        text: uncachedTexts,
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
    
    // 翻訳結果を処理
    if (response.data && response.data.translations && response.data.translations.length > 0) {
      // 翻訳結果をキャッシュに保存
      uncachedTexts.forEach((text, index) => {
        if (response.data.translations[index]) {
          const translated = response.data.translations[index].text;
          saveToCache(text, translated, enToJaCache);
          cachedResults[text] = translated;
        } else {
          cachedResults[text] = text;
        }
      });
      
      // 元の順序で結果を返す
      return texts.map(text => cachedResults[text] || text);
    } else {
      console.error('DeepL APIから翻訳結果が返されませんでした', response.data);
      return texts;
    }
  } catch (error) {
    console.error('一括翻訳エラー:', error);
    return texts;
  }
} 