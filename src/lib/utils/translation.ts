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
 * 翻訳結果を後処理する関数
 * 括弧内の説明や余分な修飾を取り除く
 * @param translatedText 翻訳されたテキスト
 * @returns 後処理されたテキスト
 */
function postProcessTranslation(translatedText: string): string {
  // 括弧内のテキストを削除 (例: "salmon (any fish of the family Salmonidae)" → "salmon")
  let processed = translatedText.replace(/\s*\([^)]*\)/g, '');
  
  // コンマ以降の説明的な部分を削除 (例: "rice, white" → "rice")
  processed = processed.replace(/,.*$/, '');
  
  // 余分な空白をトリム
  processed = processed.trim();
  
  // 複数の単語がある場合、食品名として最も関連性の高いと思われる最初の単語または単語群を保持
  // 例: "Japanese rice" は保持するが "various types of fish" の場合は "fish" のみ抽出したい
  if (processed.includes(' ')) {
    // 形容詞+名詞の組み合わせを維持するための簡易ルール
    // 3単語以上の場合は、最初の2単語のみ保持（ヒューリスティックな対応）
    const words = processed.split(' ');
    if (words.length > 2) {
      // 最初の2単語を保持（例: "Japanese rice"）、または最後の単語（主要な名詞と想定）
      processed = words.slice(0, 2).join(' ');
    }
  }
  
  return processed;
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
      
      // 翻訳結果を後処理
      const processedTranslation = postProcessTranslation(translated);
      
      // 後処理された結果をキャッシュに保存
      saveToCache(text, processedTranslation, jaToEnCache);
      
      return processedTranslation;
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
      
      // 日本語への翻訳も後処理を適用（必要に応じて）
      const processedTranslation = postProcessTranslation(translated);
      
      // 後処理された結果をキャッシュに保存
      saveToCache(text, processedTranslation, enToJaCache);
      
      return processedTranslation;
    } else {
      console.error('DeepL APIから翻訳結果が返されませんでした', response.data);
      return text; // エラー時は元のテキストを返す
    }
  } catch (error) {
    console.error('翻訳エラー:', error);
    return text; // エラー時は元のテキストを返す
  }
}