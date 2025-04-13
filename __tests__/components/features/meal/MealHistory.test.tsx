/**
 * MealHistoryコンポーネントのテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MealHistory } from '@/components/features/meal/MealHistory';
import '@testing-library/jest-dom';

// fetchをモック
global.fetch = jest.fn() as jest.Mock;

describe('MealHistory', () => {
  const mockMeals = [
    {
      id: 'meal1',
      mealType: 'breakfast',
      date: '2023-06-01',
      items: [
        {
          id: 'item1',
          name: '食パン',
          quantity: 60,
          unit: 'g',
          caloriesPerHundredGrams: 240,
          proteinPerHundredGrams: 8,
          fatPerHundredGrams: 5,
          carbsPerHundredGrams: 40,
          totalCalories: 144,
          totalProtein: 4.8,
          totalFat: 3,
          totalCarbs: 24
        }
      ]
    },
    {
      id: 'meal2',
      mealType: 'lunch',
      date: '2023-06-15',
      items: [
        {
          id: 'item2',
          name: 'サラダ',
          quantity: 150,
          unit: 'g',
          caloriesPerHundredGrams: 25,
          proteinPerHundredGrams: 1,
          fatPerHundredGrams: 0.2,
          carbsPerHundredGrams: 5,
          totalCalories: 37.5,
          totalProtein: 1.5,
          totalFat: 0.3,
          totalCarbs: 7.5
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトの成功レスポンスを設定
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMeals
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('初期ローディング状態が表示されること', async () => {
    // APIレスポンスを遅延させる
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => mockMeals
        });
      }, 100);
    }));

    render(<MealHistory />);

    // ローディングプレースホルダーが表示されることを確認
    const pulseDivs = document.querySelectorAll('.animate-pulse');
    expect(pulseDivs.length).toBeGreaterThan(0);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/meals', expect.any(Object));
    });
  });

  it('エラー表示とリトライ機能が動作すること', async () => {
    // APIエラーをモック
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<MealHistory />);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/食事記録の取得に失敗しました/)).toBeInTheDocument();
    });

    // 再読み込みボタンがあることを確認
    const reloadButton = screen.getByText('再読み込み');
    expect(reloadButton).toBeInTheDocument();

    // fetchをリセット
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMeals
    });

    // 再読み込みボタンをクリック
    fireEvent.click(reloadButton);

    // APIが再度呼ばれることを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 