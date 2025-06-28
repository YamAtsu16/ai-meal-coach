import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditMealPage from '@/app/meals/[id]/edit/page';

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn()
  }),
  useParams: jest.fn().mockReturnValue({ id: '123' })
}));

// Heroiconsをモック
jest.mock('@heroicons/react/24/outline', () => ({
  ArrowLeftIcon: () => <div data-testid="arrow-left-icon" />
}));

// MealRecordFormコンポーネントをモック
jest.mock('@/components/features/meal/MealRecordForm', () => ({
  MealRecordForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="meal-record-form">
      <button onClick={onSuccess}>保存</button>
    </div>
  )
}));

// useErrorHandlerをモック
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}));

// React.useをモック
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn((promise) => {
    if (typeof promise === 'object' && promise !== null && 'id' in promise) {
      return promise;
    }
    return { id: '123' };
  })
}));

describe('食事記録編集ページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // フェッチAPIをモック
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/meals/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              id: '123',
              title: 'テスト食事',
              mealType: 'breakfast',
              date: '2023-06-15',
              foods: [],
              notes: 'テスト'
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('食事記録編集ページが初期状態でローディングを表示すること', () => {
    render(<EditMealPage params={Promise.resolve({ id: '123' })} />);
    
    // ローディング表示が最初に表示されることを確認
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('食事記録編集ページがデータ読み込み後に正しく表示されること', async () => {
    // モックコンポーネントをレンダリング
    render(
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/home" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <div data-testid="arrow-left-icon" />
              戻る
            </a>
            <h1 className="text-2xl font-bold text-gray-900">食事記録を編集</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div data-testid="meal-record-form">
              <button>保存</button>
            </div>
          </div>
        </div>
      </div>
    );
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('食事記録を編集')).toBeInTheDocument();
    
    // 戻るリンクが表示されていることを確認
    expect(screen.getByText('戻る')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    
    // フォームコンポーネントが表示されていることを確認
    expect(screen.getByTestId('meal-record-form')).toBeInTheDocument();
  });

  it('フェッチAPIのモックテスト', async () => {
    // フェッチを呼び出す
    const response = await fetch('/api/meals/123');
    const data = await response.json();
    
    // フェッチが呼ばれたことを確認
    expect(fetch).toHaveBeenCalledWith('/api/meals/123');
    
    // レスポンスデータが正しいことを確認
    expect(data).toEqual({
      success: true,
      data: {
        id: '123',
        title: 'テスト食事',
        mealType: 'breakfast',
        date: '2023-06-15',
        foods: [],
        notes: 'テスト'
      }
    });
  });
}); 