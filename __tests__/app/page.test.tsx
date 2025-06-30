import React from 'react';
import { waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '@/app/page';
import { renderWithProviders, setupFetchMock, setupRouterMock } from '../utils/test-utils';

// framer-motionのモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation');

// useErrorHandlerをモック
const mockHandleError = jest.fn();
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    error: null,
    clearError: jest.fn(),
    extractErrorFromResponse: jest.fn()
  })
}));

describe('ランディングページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = ''; // DOMをクリア
  });

  it('認証チェック中はローディング表示されること', () => {
    // フェッチが解決されない状態をシミュレート
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<LandingPage />);
    
    // ローディングスピナーが表示されていることを確認
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('認証済み状態ではホームページにリダイレクトすること', async () => {
    setupFetchMock({ authenticated: true });
    const { replace } = setupRouterMock();
    
    renderWithProviders(<LandingPage />);
    
    // リダイレクトが呼ばれたことを確認
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/home');
    });
  });

  it('認証チェックが完了したが未認証の場合、ランディングページが表示されること', async () => {
    setupFetchMock({ authenticated: false });
    const { replace } = setupRouterMock();
    
    renderWithProviders(<LandingPage />);
    
    // ローディングが終了するまで待機
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    
    // リダイレクトが呼ばれないことを確認
    expect(replace).not.toHaveBeenCalled();
    
    // ランディングページのコンテンツが表示されていることを確認
    const heroSection = document.querySelector('section');
    expect(heroSection).toBeInTheDocument();
  });

  it('ランディングページのUI要素が正しくレンダリングされること', async () => {
    // 認証チェック完了後の状態をモック
    setupFetchMock({ authenticated: false });
    
    renderWithProviders(<LandingPage />);
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    
    // ヘッダーセクションのテスト - 柔軟なテキスト検索を使用
    expect(screen.getByText(/あなたの食事を.*がサポート/)).toBeInTheDocument();
    expect(screen.getByText(/健康的な食生活をAIが総合的にサポート/)).toBeInTheDocument();
    
    // 機能紹介セクションのテスト
    await waitFor(() => {
      expect(screen.getByText('アプリの特徴')).toBeInTheDocument();
    });
    
    // 特徴カードのテスト
    expect(screen.getByText('AIによる栄養分析')).toBeInTheDocument();
    expect(screen.getByText('簡単食事記録')).toBeInTheDocument();
    expect(screen.getByText('目標設定と進捗管理')).toBeInTheDocument();
    
    // CTAボタンのテスト - getAllByRoleを使用して複数の要素に対応
    const startButtons = screen.getAllByRole('link', { name: '無料で始める' });
    expect(startButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('認証APIがエラーを返した場合、エラーハンドリングが行われること', async () => {
    // 特定のAPIパスに対してのみエラーをシミュレート
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/auth/check') {
        return Promise.reject(new Error('API Error'));
      }
      return originalFetch(url);
    });
    
    renderWithProviders(<LandingPage />);
    
    // エラーハンドラーが呼ばれるまで待機
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        '認証状態の確認中にエラーが発生しました'
      );
    });
  });
}); 