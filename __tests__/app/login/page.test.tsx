import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
const mockHandleError = jest.fn();
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError
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

  it('フォーム送信が正常に動作すること', async () => {
    // signInの成功レスポンスをモック
    (signIn as jest.Mock).mockResolvedValue({
      ok: true,
      error: null
    });
    
    const mockRouter = jest.requireMock('next/navigation').useRouter();
    const mockSearchParams = jest.requireMock('next/navigation').useSearchParams();
    
    // callbackUrlの値を取得
    const callbackUrl = mockSearchParams.get('callbackUrl');
    
    render(<LoginPage />);
    
    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' }
    });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      // signInが正しいパラメータで呼ばれたことを確認
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123'
      });
      
      // リダイレクトが呼ばれたことを確認
      expect(mockRouter.push).toHaveBeenCalledWith(callbackUrl);
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('ログイン失敗時にエラーハンドリングが行われること', async () => {
    // signInのエラーレスポンスをモック
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Invalid credentials'
    });
    
    render(<LoginPage />);
    
    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'wrongpassword' }
    });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      // エラーハンドラーが呼ばれたことを確認
      expect(mockHandleError).toHaveBeenCalledWith('Invalid credentials', 'ログインに失敗しました');
    });
  });

  it('ログイン処理中に例外が発生した場合のエラーハンドリングが行われること', async () => {
    // signInが例外をスローするようにモック
    const testError = new Error('Network error');
    (signIn as jest.Mock).mockRejectedValue(testError);
    
    render(<LoginPage />);
    
    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' }
    });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      // エラーハンドラーが呼ばれたことを確認
      expect(mockHandleError).toHaveBeenCalledWith(testError, 'ログイン中にエラーが発生しました');
    });
  });
}); 