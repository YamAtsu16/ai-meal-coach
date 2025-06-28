import React from 'react';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '@/app/page';
import { renderWithProviders, setupFetchMock, setupRouterMock } from '../utils/test-utils';

// framer-motionのモック
jest.mock('framer-motion');

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation');

// useErrorHandlerをモック
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}));

describe('ランディングページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  // エラーハンドリングのテストはスキップする
  it.skip('認証チェックでエラーが発生した場合、エラーハンドリングが正しく動作すること', async () => {
    // コンソールエラーをキャプチャ
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // 認証エラーを発生させる
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.reject({ message: '認証エラー' })
    );
    
    renderWithProviders(<LandingPage />);
    
    // エラーが発生したことを確認
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // コンソールエラーを元に戻す
    console.error = originalConsoleError;
  });
}); 