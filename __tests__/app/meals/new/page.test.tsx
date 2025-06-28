import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewMealRecordPage from '@/app/meals/new/page';

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn()
  })
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

describe('新規食事記録ページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ページが正しくレンダリングされること', () => {
    render(<NewMealRecordPage />);
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('食事を記録')).toBeInTheDocument();
    
    // 戻るリンクが表示されていることを確認
    expect(screen.getByText('戻る')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    expect(screen.getByText('戻る').closest('a')).toHaveAttribute('href', '/home');
    
    // フォームコンポーネントが表示されていることを確認
    expect(screen.getByTestId('meal-record-form')).toBeInTheDocument();
  });

  it('フォーム送信後にホームページにリダイレクトすること', () => {
    // useRouterのモック
    const pushMock = jest.fn();
    jest.requireMock('next/navigation').useRouter.mockReturnValue({
      push: pushMock
    });
    
    render(<NewMealRecordPage />);
    
    // 保存ボタンをクリック
    screen.getByText('保存').click();
    
    // ホームページにリダイレクトされることを確認
    expect(pushMock).toHaveBeenCalledWith('/home');
  });
}); 