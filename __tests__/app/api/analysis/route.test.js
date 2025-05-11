/**
 * 食事分析APIのテスト
 */
import { POST } from '@/app/api/analysis/route';
import { getToken } from 'next-auth/jwt';
import * as openai from '@/lib/utils/openai';

// next-auth/jwtをモック
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}));

// OpenAIの分析モジュールをモック
jest.mock('@/lib/utils/openai', () => ({
  analyzeMeals: jest.fn()
}));

// NextResponseをモック
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: (body, options) => {
        return {
          status: options?.status || 200,
          json: async () => body,
          headers: new Map()
        };
      }
    }
  };
});

// グローバルfetchをモック
global.fetch = jest.fn();

describe('食事分析API', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 環境変数の設定
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'test-openai-api-key'
    };
    
    // 認証トークンのモック
    getToken.mockResolvedValue({
      id: 'user123',
      name: 'テストユーザー',
      email: 'test@example.com',
      raw: 'mock-token'
    });
    
    // OpenAI分析結果のモック
    openai.analyzeMeals.mockResolvedValue({
      totalCalories: 2000,
      totalProtein: 100,
      totalFat: 60,
      totalCarbs: 250,
      analysis: 'よくバランスの取れた食事です。',
      recommendations: '水分をもう少し増やすことをお勧めします。'
    });
    
    // fetch応答のモック設定
    const mockProfileResponse = {
      success: true,
      data: {
        gender: '男性',
        birthDate: '1990-01-01',
        height: 170,
        weight: 70,
        activityLevel: '普通',
        goal: '減量',
        targetCalories: 2000,
        targetProtein: 120,
        targetFat: 60,
        targetCarbs: 200
      }
    };
    
    const mockMealsResponse = [
      {
        _id: '60d21b4667d0d8992e610c85',
        userId: 'user123',
        mealType: '朝食',
        date: '2023-05-01T07:00:00.000Z',
        items: [
          {
            foodId: 'food_123',
            label: 'りんご',
            quantity: 1,
            nutrients: {
              ENERC_KCAL: 52,
              PROCNT: 0.26,
              FAT: 0.17,
              CHOCDF: 13.81
            }
          }
        ]
      },
      {
        _id: '60d21b4667d0d8992e610c86',
        userId: 'user123',
        mealType: '昼食',
        date: '2023-05-01T12:00:00.000Z',
        items: [
          {
            foodId: 'food_456',
            label: 'サンドイッチ',
            quantity: 1,
            nutrients: {
              ENERC_KCAL: 450,
              PROCNT: 20,
              FAT: 22,
              CHOCDF: 45
            }
          }
        ]
      }
    ];
    
    // fetchのレスポンスを設定
    global.fetch.mockImplementation((url) => {
      if (url.toString().includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfileResponse)
        });
      } else if (url.toString().includes('/api/meals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMealsResponse)
        });
      }
      return Promise.reject(new Error('不明なURL'));
    });
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('指定日の食事分析を正常に実行できること', async () => {
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2023-05-01' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      mealCount: 2,
      result: {
        totalCalories: 2000,
        totalProtein: 100,
        totalFat: 60,
        totalCarbs: 250,
        analysis: 'よくバランスの取れた食事です。',
        recommendations: '水分をもう少し増やすことをお勧めします。'
      },
      startDate: expect.any(String),
      endDate: expect.any(String)
    });
    
    // fetchが正しく呼ばれたことを確認
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/profile'), expect.anything());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/meals'), expect.anything());
    
    // OpenAIの分析関数が呼ばれたことを確認
    expect(openai.analyzeMeals).toHaveBeenCalledWith(expect.any(Array), expect.any(Object));
  });
  
  it('日付が指定されていない場合は400エラーを返すこと', async () => {
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('日付が指定されていません');
  });
  
  it('OpenAI APIキーが設定されていない場合は500エラーを返すこと', async () => {
    delete process.env.OPENAI_API_KEY;
    
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2023-05-01' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('OpenAI APIキーが設定されていません');
  });
  
  it('認証されていない場合は401エラーを返すこと', async () => {
    // 認証失敗のモック
    getToken.mockResolvedValueOnce(null);
    
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2023-05-01' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('認証エラー');
  });
  
  it('食事記録の取得に失敗した場合は500エラーを返すこと', async () => {
    // 食事記録の取得失敗をモック
    global.fetch.mockImplementation((url) => {
      if (url.toString().includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {}
          })
        });
      } else if (url.toString().includes('/api/meals')) {
        return Promise.resolve({
          ok: false,
          status: 500
        });
      }
      return Promise.reject(new Error('不明なURL'));
    });
    
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2023-05-01' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('食事記録の取得に失敗しました');
  });
  
  it('指定期間内の食事記録がない場合は404エラーを返すこと', async () => {
    // 空の食事記録をモック
    global.fetch.mockImplementation((url) => {
      if (url.toString().includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {}
          })
        });
      } else if (url.toString().includes('/api/meals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.reject(new Error('不明なURL'));
    });
    
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2023-05-01' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('指定期間内の食事記録が見つかりませんでした');
  });
  
  it('分析処理中にエラーが発生した場合は500エラーを返すこと', async () => {
    // OpenAI分析エラーをシミュレート
    openai.analyzeMeals.mockRejectedValueOnce(
      new Error('OpenAI API呼び出しエラー')
    );
    
    const request = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2023-05-01' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('分析処理中にエラーが発生しました');
  });
}); 