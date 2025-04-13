/**
 * DashboardChartsコンポーネントのテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardCharts } from '@/components/features/meal/DashboardCharts';
import '@testing-library/jest-dom';
import * as ErrorHandler from '@/lib/hooks/useErrorHandler';
import { Nutrition } from '@/lib/types';
import { DatabaseMealRecord } from '@/lib/types';
import { UserProfileFormData } from '@/lib/types';

// fetchをモック
global.fetch = jest.fn() as jest.Mock;

// エラーハンドラーをモック
const mockHandleError = jest.fn();
jest.spyOn(ErrorHandler, 'useErrorHandler').mockImplementation(() => ({
  handleError: mockHandleError,
  error: null,
  clearError: jest.fn(),
  extractErrorFromResponse: jest.fn()
}));

// windowのconfirmをモック
window.confirm = jest.fn();

// 子コンポーネントをモック
jest.mock('@/components/features/meal/NutritionBalanceChart', () => ({
  NutritionBalanceChart: ({ totalNutrition }: { totalNutrition: Nutrition }) => (
    <div data-testid="nutrition-balance-chart">
      NutritionBalanceChart: {JSON.stringify(totalNutrition)}
    </div>
  )
}));

jest.mock('@/components/features/meal/GoalComparisonCharts', () => ({
  GoalComparisonCharts: ({ totalNutrition, userProfile }: { totalNutrition: Nutrition, userProfile: UserProfileFormData | null }) => (
    <div data-testid="goal-comparison-charts">
      GoalComparisonCharts: {JSON.stringify({ totalNutrition, userProfile })}
    </div>
  )
}));

jest.mock('@/components/features/meal/MealRecordList', () => ({
  MealRecordList: ({ selectedDateMeals }: { selectedDateMeals: DatabaseMealRecord[] }) => (
    <div data-testid="meal-record-list">
      MealRecordList: {selectedDateMeals.length} 件
    </div>
  )
}));

describe('DashboardCharts', () => {
  // モックの食事記録データ
  const mockMeals = [
    {
      _id: 'meal1',
      id: 'meal1',
      mealType: 'breakfast',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          id: 'item1',
          name: '食品1',
          quantity: 100,
          unit: 'g',
          totalCalories: 200,
          totalProtein: 10,
          totalFat: 5,
          totalCarbs: 30
        }
      ]
    },
    {
      _id: 'meal2',
      id: 'meal2',
      mealType: 'lunch',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          id: 'item2',
          name: '食品2',
          quantity: 150,
          unit: 'g',
          totalCalories: 300,
          totalProtein: 15,
          totalFat: 10,
          totalCarbs: 40
        }
      ]
    }
  ];

  // モックのユーザープロファイルデータ
  const mockUserProfile = {
    targetCalories: 2000,
    targetProtein: 60,
    targetFat: 70,
    targetCarbs: 300
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // モックレスポンスを設定
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/meals') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMeals)
        });
      } else if (url === '/api/profile') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockUserProfile
          })
        });
      } else if (url.includes('/api/meals/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    (window.confirm as jest.Mock).mockReturnValue(true);
  });

  it('ローディング中は適切に表示されること', async () => {
    // APIリクエストを遅延させる
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve(mockMeals)
      });
    }, 100)));
    
    render(<DashboardCharts />);
    
    // ローディング表示を確認 - アニメーションクラスをもつ要素が存在することを確認
    const animationElements = document.querySelectorAll('.animate-pulse');
    expect(animationElements.length).toBeGreaterThan(0);
  });

  it('食事記録とユーザープロファイルを取得して表示すること', async () => {
    render(<DashboardCharts />);
    
    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/meals', expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.any(Object));
    });
    
    // コンポーネントが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/総摂取カロリー/)).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument(); // 合計カロリー
      expect(screen.getByTestId('nutrition-balance-chart')).toBeInTheDocument();
      expect(screen.getByTestId('goal-comparison-charts')).toBeInTheDocument();
      expect(screen.getByTestId('meal-record-list')).toBeInTheDocument();
      expect(screen.getByText('MealRecordList: 2 件')).toBeInTheDocument();
    });
  });

  it('日付を変更すると、選択された日付の食事記録がフィルタリングされること', async () => {
    // 昨日の日付を計算
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    // 昨日の日付の食事記録を追加
    const mockMealsWithYesterday = [
      ...mockMeals,
      {
        _id: 'meal3',
        id: 'meal3',
        mealType: 'dinner',
        date: yesterdayString,
        items: [
          {
            id: 'item3',
            name: '食品3',
            quantity: 200,
            unit: 'g',
            totalCalories: 400,
            totalProtein: 20,
            totalFat: 15,
            totalCarbs: 50
          }
        ]
      }
    ];
    
    // モックレスポンスを上書き
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/meals') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMealsWithYesterday)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockUserProfile })
      });
    });
    
    render(<DashboardCharts />);
    
    // 最初は今日の食事記録が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('MealRecordList: 2 件')).toBeInTheDocument();
    });
    
    // 日付を昨日に変更 - typeが"date"の要素を直接取得
    const dateInput = document.querySelector('input[type="date"]');
    expect(dateInput).not.toBeNull();
    fireEvent.change(dateInput!, { target: { value: yesterdayString } });
    
    // 昨日の食事記録だけが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('MealRecordList: 1 件')).toBeInTheDocument();
    });
  });

  it('更新ボタンをクリックすると、データが再取得されること', async () => {
    render(<DashboardCharts />);
    
    // 初期データが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('MealRecordList: 2 件')).toBeInTheDocument();
    });
    
    // fetchのモックをリセット
    (global.fetch as jest.Mock).mockClear();
    
    // 更新ボタンをクリック
    fireEvent.click(screen.getByText('更新'));
    
    // APIが再度呼ばれることを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/meals', expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.any(Object));
    });
  });

  it('食事記録がない場合、適切なメッセージが表示されること', async () => {
    // 空の食事記録をモック
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/meals') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockUserProfile })
      });
    });
    
    render(<DashboardCharts />);
    
    // 「食事記録がありません」のメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('食事記録がありません。新しい食事を記録してみましょう。')).toBeInTheDocument();
    });
  });

  it('食事記録取得中にエラーが発生した場合、エラーハンドラーが呼ばれること', async () => {
    // エラーレスポンスをモック
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/meals') {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockUserProfile })
      });
    });
    
    render(<DashboardCharts />);
    
    // エラーハンドラーが呼ばれることを確認
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        '食事記録の取得に失敗しました'
      );
    });
  });
}); 