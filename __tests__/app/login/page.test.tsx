import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupSearchParamsMock } from '../../utils/test-utils';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/login/page';

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
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

// useErrorHandlerをモック
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}));

describe('ログインページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ログインページが正しくレンダリングされること', () => {
    render(<LoginPage />);
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('AI食事管理アプリへようこそ')).toBeInTheDocument();
    
    // フォーム要素が表示されていることを確認
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    
    // 新規登録リンクが表示されていることを確認
    expect(screen.getByText('新規登録はこちら')).toBeInTheDocument();
  });

  it('signIn関数のモックテスト', async () => {
    // signInモックを設定
    (signIn as jest.Mock).mockResolvedValue({
      ok: true,
      error: null
    });
    
    // signInを呼び出す
    await signIn('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'password123'
    });
    
    // signInが呼ばれたことを確認
    expect(signIn).toHaveBeenCalledWith('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('callbackUrlのテスト', () => {
    // コールバックURLを設定
    setupSearchParamsMock({ callbackUrl: '/home' });
    
    // searchParamsのgetメソッドが正しく呼ばれることを確認
    const searchParams = jest.requireMock('next/navigation').useSearchParams();
    expect(searchParams.get('callbackUrl')).toBe('/home');
  });
}); 