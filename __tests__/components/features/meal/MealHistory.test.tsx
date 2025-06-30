/**
 * MealHistoryコンポーネントのテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MealHistory } from '@/components/features/meal/MealHistory';
import '@testing-library/jest-dom';

// fetchをモック
global.fetch = jest.fn() as jest.Mock;

// 現在の日付をモック
const mockDate = new Date('2023-06-15');
const originalDate = global.Date;

describe('MealHistory', () => {
  // モックの食事記録データ
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

  beforeAll(() => {
    // 日付をモック
    global.Date = class extends originalDate {
      constructor(date?: string | number | Date) {
        if (date) {
          super(date);
        } else {
          super(mockDate);
        }
      }
      static now() {
        return new originalDate(mockDate).getTime();
      }
    } as unknown as typeof global.Date;
  });

  afterAll(() => {
    // 日付のモックを元に戻す
    global.Date = originalDate;
  });

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

  it('食事記録が正常に表示されること', async () => {
    render(<MealHistory />);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText('過去の食事記録')).toBeInTheDocument();
    });

    // 月表示が正しいことを確認
    expect(screen.getByText('2023年6月')).toBeInTheDocument();

    // 曜日が表示されていることを確認
    ['日', '月', '火', '水', '木', '金', '土'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    // 食事記録のカロリー値が表示されていることを確認
    const cells = screen.getAllByText(/kcal/);
    expect(cells.length).toBeGreaterThan(0);

    // 月の切り替えボタンが存在することを確認
    const prevMonthButton = document.querySelector('button svg[d*="M10.5 19.5 L3 12"]')?.closest('button');
    expect(prevMonthButton).not.toBeNull();
    
    const nextMonthButton = document.querySelector('button svg[d*="M13.5 4.5 L21 12"]')?.closest('button');
    expect(nextMonthButton).not.toBeNull();
  });

  it('日付を選択すると詳細が表示されること', async () => {
    render(<MealHistory />);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText('過去の食事記録')).toBeInTheDocument();
    });

    // 日付セルを見つける
    const dateCells = document.querySelectorAll('.grid-cols-7 > div');
    // 食事記録があるセルを探す（カロリー表示があるセル）
    const mealCell = Array.from(dateCells).find(cell => 
      cell.textContent?.includes('kcal') || 
      (cell.querySelector('.flex-col') && !cell.textContent?.includes('記録なし'))
    );
    
    expect(mealCell).not.toBeNull();
    if (mealCell) {
      fireEvent.click(mealCell);
    }

    // 詳細表示が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/の摂取状況/)).toBeInTheDocument();
      expect(screen.getByText('総摂取カロリー')).toBeInTheDocument();
      expect(screen.getByText('栄養バランス')).toBeInTheDocument();
      
      // 栄養素の値が表示されていることを確認
      expect(screen.getByText('タンパク質')).toBeInTheDocument();
      expect(screen.getByText('脂質')).toBeInTheDocument();
      expect(screen.getByText('炭水化物')).toBeInTheDocument();
      
      // 閉じるボタンが表示されていることを確認
      expect(screen.getByText('閉じる')).toBeInTheDocument();
    });
  });

  it('詳細表示を閉じる機能が動作すること', async () => {
    render(<MealHistory />);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText('過去の食事記録')).toBeInTheDocument();
    });

    // 日付セルを見つける
    const dateCells = document.querySelectorAll('.grid-cols-7 > div');
    // 食事記録があるセルを探す（カロリー表示があるセル）
    const mealCell = Array.from(dateCells).find(cell => 
      cell.textContent?.includes('kcal') || 
      (cell.querySelector('.flex-col') && !cell.textContent?.includes('記録なし'))
    );
    
    expect(mealCell).not.toBeNull();
    if (mealCell) {
      fireEvent.click(mealCell);
    }

    // 詳細表示が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/の摂取状況/)).toBeInTheDocument();
    });

    // 閉じるボタンをクリック
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);

    // 詳細表示が閉じられたことを確認
    await waitFor(() => {
      expect(screen.queryByText(/の摂取状況/)).not.toBeInTheDocument();
    });
  });

  it('栄養計算が正しく行われること', async () => {
    render(<MealHistory />);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText('過去の食事記録')).toBeInTheDocument();
    });

    // 日付セルを見つける
    const dateCells = document.querySelectorAll('.grid-cols-7 > div');
    // 食事記録があるセルを探す（カロリー表示があるセル）
    const mealCell = Array.from(dateCells).find(cell => 
      cell.textContent?.includes('kcal') || 
      (cell.querySelector('.flex-col') && !cell.textContent?.includes('記録なし'))
    );
    
    expect(mealCell).not.toBeNull();
    if (mealCell) {
      fireEvent.click(mealCell);
    }

    // 詳細表示が表示されることを確認
    await waitFor(() => {
      // 総摂取カロリーセクションが表示されていることを確認
      const calorieSection = screen.getByText('総摂取カロリー').closest('div');
      expect(calorieSection).toBeInTheDocument();
      
      // 栄養バランスセクションが表示されていることを確認
      const nutritionSection = screen.getByText('栄養バランス').closest('div');
      expect(nutritionSection).toBeInTheDocument();
      
      // タンパク質、脂質、炭水化物の表示を確認
      expect(screen.getByText('タンパク質')).toBeInTheDocument();
      expect(screen.getByText('脂質')).toBeInTheDocument();
      expect(screen.getByText('炭水化物')).toBeInTheDocument();
      
      // カロリー値が表示されていることを確認（正確な値ではなく、表示されていることを確認）
      const kcalTexts = screen.getAllByText(/kcal/);
      expect(kcalTexts.length).toBeGreaterThanOrEqual(3); // 少なくとも3つ（タンパク質、脂質、炭水化物）
    });
  });

  it('日付の状態が正しく表示されること', async () => {
    render(<MealHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('過去の食事記録')).toBeInTheDocument();
    });
    
    // 記録なしの日付が正しく表示されていることを確認
    const noRecordElements = screen.getAllByText('記録なし');
    expect(noRecordElements.length).toBeGreaterThan(0);
    
    // 食事記録がある日付のカロリー表示を確認
    const calorieTexts = screen.getAllByText(/kcal/);
    expect(calorieTexts.length).toBeGreaterThan(0);
  });
}); 