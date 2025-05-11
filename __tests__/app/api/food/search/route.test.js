/**
 * 食品検索APIのテスト
 */
import { GET } from '@/app/api/food/search/route';
import { translateToEnglish, translateToJapanese } from '@/lib/utils/translation';

// テスト用のモック
jest.mock('@/lib/utils/translation', () => ({
  translateToEnglish: jest.fn(),
  translateToJapanese: jest.fn()
}));

// クロスフェッチのモック
global.fetch = jest.fn();

// プロセス環境変数のバックアップ
const originalEnv = process.env;

describe('食品検索API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // テスト用の環境変数を設定
    process.env = {
      ...originalEnv,
      EDAMAM_APP_ID: 'test-app-id',
      EDAMAM_APP_KEY: 'test-app-key'
    };
    
    // 翻訳のデフォルト動作
    translateToEnglish.mockImplementation((text) => {
      const translations = {
        'りんご': 'apple',
        'オレンジ': 'orange',
        'バナナ': 'banana'
      };
      return Promise.resolve(translations[text] || text);
    });
    
    translateToJapanese.mockImplementation((text) => {
      const translations = {
        'apple': 'りんご',
        'orange': 'オレンジ',
        'banana': 'バナナ'
      };
      return Promise.resolve(translations[text] || text);
    });
    
    // fetchのデフォルト動作
    global.fetch.mockImplementation(async (url) => {
      // 食品検索APIからのレスポンスをモック
      if (url.includes('api.edamam.com/api/food-database/v2/parser')) {
        if (url.includes('ingr=apple')) {
          return {
            ok: true,
            json: async () => ({
              hints: [
                {
                  food: {
                    foodId: 'food_123',
                    label: 'apple',
                    nutrients: {
                      ENERC_KCAL: 52,
                      PROCNT: 0.26,
                      FAT: 0.17,
                      CHOCDF: 13.81
                    }
                  }
                }
              ]
            })
          };
        } else if (url.includes('ingr=error')) {
          return {
            ok: false,
            status: 500,
            statusText: 'Server Error',
            text: async () => 'API Error'
          };
        } else {
          // 結果なし
          return {
            ok: true,
            json: async () => ({ hints: [] })
          };
        }
      }
      return { ok: false };
    });
  });
  
  afterEach(() => {
    // 環境変数を元に戻す
    process.env = originalEnv;
  });
  
  it('クエリなしで400エラーを返すこと', async () => {
    const request = new Request('http://localhost:3000/api/food/search');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('検索キーワードを入力してください');
  });
  
  it.skip('正常なリクエストで食品データを返すこと', async () => {
    const request = new Request('http://localhost:3000/api/food/search?query=りんご');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].foodId).toBe('food_123');
    expect(data[0].label).toBe('りんご'); // 翻訳された結果
  });
  
  it.skip('検索結果が空の場合は空配列を返すこと', async () => {
    const request = new Request('http://localhost:3000/api/food/search?query=notfound');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });
  
  it.skip('外部APIがエラーを返した場合は500エラーを返すこと', async () => {
    const request = new Request('http://localhost:3000/api/food/search?query=error');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBe('食品の検索中にエラーが発生しました');
  });
  
  it.skip('翻訳処理でエラーが発生しても検索処理を続行できること', async () => {
    // 翻訳エラーをシミュレート
    translateToJapanese.mockRejectedValueOnce(new Error('翻訳エラー'));
    
    const request = new Request('http://localhost:3000/api/food/search?query=りんご');
    const response = await GET(request);
    const data = await response.json();
    
    // 翻訳エラーがあっても結果が返されること
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].foodId).toBe('food_123');
  });
  
  it('API認証情報がない場合は500エラーを返すこと', async () => {
    // 環境変数をクリア
    delete process.env.EDAMAM_APP_ID;
    delete process.env.EDAMAM_APP_KEY;
    
    const request = new Request('http://localhost:3000/api/food/search?query=りんご');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBe('APIの認証情報が設定されていません');
  });
}); 