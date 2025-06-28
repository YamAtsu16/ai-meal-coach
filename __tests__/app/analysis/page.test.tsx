import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisPage from '@/app/analysis/page';

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null)
  })
}));

// Heroiconsをモック
jest.mock('@heroicons/react/24/outline', () => ({
  ClockIcon: () => <div data-testid="clock-icon" />
}));

// NutritionAdviceコンポーネントをモック
jest.mock('@/components/features/analysis/NutritionAdvice', () => {
  return {
    __esModule: true,
    default: ({ selectedDate }: { selectedDate: string }) => (
      <div data-testid="nutrition-advice">
        <p>選択された日付: {selectedDate}</p>
      </div>
    )
  };
});

describe('栄養分析ページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 現在の日付をモック
    const mockDate = new Date('2023-06-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ページが正しくレンダリングされること', () => {
    render(<AnalysisPage />);
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByRole('heading', { level: 1, name: '食事分析' })).toBeInTheDocument();
    
    // 日付選択セクションが表示されていることを確認
    expect(screen.getByText('分析する日付を選択')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '分析する日付を選択' })).toBeInTheDocument();
    const dateInput = document.getElementById('date-select');
    expect(dateInput).toBeInTheDocument();
    expect(screen.getByText('選択した日付の食事記録が分析されます')).toBeInTheDocument();
    
    // 栄養アドバイスコンポーネントが表示されていることを確認
    expect(screen.getByTestId('nutrition-advice')).toBeInTheDocument();
    expect(screen.getByText('選択された日付: 2023-06-15')).toBeInTheDocument();
  });

  it('URLから日付パラメータを取得して表示すること', () => {
    // 検索パラメータをモック
    jest.requireMock('next/navigation').useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('2023-06-10')
    });
    
    render(<AnalysisPage />);
    
    // 選択された日付が表示されていることを確認
    expect(screen.getByText('選択された日付: 2023-06-10')).toBeInTheDocument();
  });
}); 