import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/home/page';
import { renderWithProviders, setupAuthMock } from '../../utils/test-utils';

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation');

// コンポーネントをモック
jest.mock('@/components/features/meal/DashboardCharts', () => ({
  DashboardCharts: () => <div data-testid="dashboard-charts">DashboardCharts Mock</div>
}));

jest.mock('@/components/features/meal/MealHistory', () => ({
  MealHistory: () => <div data-testid="meal-history">MealHistory Mock</div>
}));

// Heroiconsをモック
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div data-testid="plus-icon" />
}));

describe('ホームページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 認証済みユーザーとしてモック
    setupAuthMock(true);
  });

  it('ページが正しくレンダリングされること', () => {
    renderWithProviders(<HomePage />);
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    
    // 記録するボタンが表示されていることを確認
    expect(screen.getByText('記録する')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    
    // コンポーネントが表示されていることを確認
    expect(screen.getByText('栄養摂取状況')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
    expect(screen.getByTestId('meal-history')).toBeInTheDocument();
  });

  it('「記録する」ボタンが正しいリンク先を持つこと', () => {
    renderWithProviders(<HomePage />);
    
    // 「記録する」ボタンのリンク先を確認
    const recordButton = screen.getByText('記録する');
    expect(recordButton.closest('a')).toHaveAttribute('href', '/meals/new');
  });

  it('DashboardChartsコンポーネントが表示されること', () => {
    renderWithProviders(<HomePage />);
    
    // DashboardChartsコンポーネントが表示されていることを確認
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
    expect(screen.getByText('DashboardCharts Mock')).toBeInTheDocument();
  });

  it('MealHistoryコンポーネントが表示されること', () => {
    renderWithProviders(<HomePage />);
    
    // MealHistoryコンポーネントが表示されていることを確認
    expect(screen.getByTestId('meal-history')).toBeInTheDocument();
    expect(screen.getByText('MealHistory Mock')).toBeInTheDocument();
  });
}); 