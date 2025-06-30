import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// mockPushの参照を取得
const mockPush = jest.requireMock('next/navigation').useRouter().push;

// next-auth/reactモジュールをモック
jest.mock('next-auth/react');

// useErrorHandlerをモック
const mockHandleError = jest.fn();
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    error: null,
    clearError: jest.fn()
  })
}));

// useToastをモック
const mockShowToast = jest.fn();
jest.mock('@/providers', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// timerをモック
jest.useFakeTimers();

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

  it('フォーム送信が成功した場合、トーストが表示され、ログインページにリダイレクトされること', async () => {
    // フェッチモックを設定
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    });
    
    render(<RegisterPage />);
    
    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'Password123!' } });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: '登録する' }));
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
    });
    
    // トーストが表示されることを確認
    expect(mockShowToast).toHaveBeenCalledWith('登録が完了しました！', 'success');
    
    // 成功メッセージが表示されることを確認
    expect(screen.getByText('登録が完了しました！ログインページに移動します...')).toBeInTheDocument();
    
    // タイマーを進める
    jest.advanceTimersByTime(3000);
    
    // ログインページにリダイレクトされることを確認
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('APIがエラーを返した場合、エラーハンドラーが呼ばれること', async () => {
    // エラーレスポンスを返すフェッチモックを設定
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'このメールアドレスは既に登録されています' })
    });
    
    render(<RegisterPage />);
    
    // フォームに値を入力
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'Password123!' } });
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: '登録する' }));
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
    });
    
    // エラーハンドラーが呼ばれることを確認
    expect(mockHandleError).toHaveBeenCalledWith(
      expect.any(Error),
      '登録に失敗しました'
    );
  });

  it('ネットワークエラーが発生した場合、エラーハンドラーが呼ばれること', async () => {
    // ネットワークエラーを発生させるフェッチモックを設定
    global.fetch = jest.fn().mockRejectedValue(new Error('ネットワークエラー'));
    
    render(<RegisterPage />);
    
    // フォームに値を入力して送信
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'Password123!' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録する' }));
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // エラーハンドラーが呼ばれることを確認
    expect(mockHandleError).toHaveBeenCalledWith(
      expect.any(Error),
      '登録に失敗しました'
    );
  });

  it('フォーム送信中はボタンが無効化されること', async () => {
    // 応答を遅延させるフェッチモックを設定
    global.fetch = jest.fn().mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }, 1000);
    }));
    
    render(<RegisterPage />);
    
    // 登録ボタンを取得
    const submitButton = screen.getByRole('button', { name: '登録する' });
    
    // フォームに値を入力して送信
    fireEvent.change(screen.getByLabelText('名前'), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'Password123!' } });
    
    fireEvent.click(submitButton);
    
    // ボタンのテキストが変更されることを確認
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('登録中...');
      expect(submitButton).toBeDisabled();
    });
    
    // タイマーを進める
    jest.advanceTimersByTime(1000);
    
    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
}); 