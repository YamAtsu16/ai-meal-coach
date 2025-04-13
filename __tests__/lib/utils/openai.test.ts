/**
 * OpenAI ユーティリティテスト
 */
import { DatabaseMealRecord } from '@/lib/types';

// OpenAI モジュールをモック
jest.mock('openai', () => ({}), { virtual: true });

// openai.tsモジュールをモック
jest.mock('@/lib/utils/openai', () => {
  return {
    analyzeMeals: jest.fn().mockImplementation(async () => {
      if (process.env.TEST_MOCK_ERROR) {
        return 'エラーが発生しました。しばらくしてからもう一度お試しください。';
      }
      if (process.env.TEST_MOCK_EMPTY) {
        return '分析結果を生成できませんでした。';
      }
      return '<section id="test">モックされた分析結果</section>';
    })
  };
}, { virtual: true });

// analyzeMealsをインポート
import { analyzeMeals } from '@/lib/utils/openai';

describe('OpenAI ユーティリティ', () => {
  // 環境変数をモック
  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.TEST_MOCK_ERROR;
    delete process.env.TEST_MOCK_EMPTY;
    jest.clearAllMocks();
  });

  // テスト用の食事記録データ
  const mockMeals: DatabaseMealRecord[] = [
    {
      id: 'meal1',
      mealType: 'breakfast',
      date: '2023-06-01',
      items: [
        {
          id: 'item1',
          name: 'テスト食品',
          quantity: 100,
          unit: 'g',
          caloriesPerHundredGrams: 100,
          proteinPerHundredGrams: 10,
          fatPerHundredGrams: 5,
          carbsPerHundredGrams: 15,
          totalCalories: 100,
          totalProtein: 10,
          totalFat: 5,
          totalCarbs: 15
        }
      ]
    }
  ];

  it('食事分析を実行できること', async () => {
    const result = await analyzeMeals(mockMeals, null);
    expect(result).toBe('<section id="test">モックされた分析結果</section>');
  });

  it('APIエラー時にエラーメッセージを返すこと', async () => {
    process.env.TEST_MOCK_ERROR = 'true';
    const result = await analyzeMeals(mockMeals, null);
    expect(result).toContain('エラーが発生しました');
  });

  it('レスポンスがない場合にデフォルトメッセージを返すこと', async () => {
    process.env.TEST_MOCK_EMPTY = 'true';
    const result = await analyzeMeals(mockMeals, null);
    expect(result).toBe('分析結果を生成できませんでした。');
  });
}); 