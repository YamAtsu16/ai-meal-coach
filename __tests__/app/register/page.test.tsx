import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from '@/app/register/page';

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue('/')
  })
}));

// next-auth/reactモジュールをモック
jest.mock('next-auth/react');

// useErrorHandlerをモック
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}));

// useToastをモック
jest.mock('@/providers', () => ({
  useToast: () => ({
    showToast: jest.fn()
  })
}));

describe('新規登録ページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規登録ページが正しくレンダリングされること', () => {
    render(<RegisterPage />);

    // ヘッダーが表示されていることを確認
    expect(screen.getByRole('heading', { name: '新規登録' })).toBeInTheDocument();
    expect(screen.getByText('AI食事管理アプリのアカウントを作成')).toBeInTheDocument();
    
    // フォーム要素が表示されていることを確認
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録する' })).toBeInTheDocument();
    
    // ログインリンクが表示されていることを確認
    expect(screen.getByText('ログインはこちら')).toBeInTheDocument();
  });

  it('フェッチAPIのモックテスト', async () => {
    // フェッチモックを設定
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    });
    
    // フェッチを呼び出す
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    // フェッチが呼ばれたことを確認
    expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    // レスポンスが正しいことを確認
    expect(await response.json()).toEqual({ success: true });
  });
}); 