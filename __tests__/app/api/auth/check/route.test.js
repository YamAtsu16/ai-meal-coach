/**
 * 認証状態チェックAPIのテスト
 */
import { GET } from '@/app/api/auth/check/route';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

// モック設定
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}
}));

describe('認証チェックAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('認証済みの場合、認証状態とユーザー情報を返すこと', async () => {
    // モックセッションデータ
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'テストユーザー',
        email: 'test@example.com'
      }
    };

    // getServerSessionのモック設定
    getServerSession.mockResolvedValue(mockSession);

    // APIを呼び出し
    const response = await GET();
    const data = await response.json();

    // レスポンスの検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual({
      authenticated: true,
      user: mockSession.user
    });
    
    // getServerSessionが呼ばれたことを確認
    expect(getServerSession).toHaveBeenCalled();
  });

  it('未認証の場合、認証状態がfalseでユーザー情報がnullを返すこと', async () => {
    // 未認証状態をモック
    getServerSession.mockResolvedValue(null);

    // APIを呼び出し
    const response = await GET();
    const data = await response.json();

    // レスポンスの検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual({
      authenticated: false,
      user: null
    });
    
    // getServerSessionが呼ばれたことを確認
    expect(getServerSession).toHaveBeenCalled();
  });

  it('エラーが発生した場合、エラーステータスとメッセージを返すこと', async () => {
    // エラーをスローするようにモック
    getServerSession.mockRejectedValue(new Error('認証エラー'));

    // コンソールエラーをモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // APIを呼び出し
    const response = await GET();
    const data = await response.json();

    // レスポンスの検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);
    expect(data).toEqual({
      authenticated: false,
      error: 'Authentication check failed'
    });
    
    // エラーがログに記録されたことを確認
    expect(consoleSpy).toHaveBeenCalledWith('認証チェックエラー:', expect.any(Error));
    
    // モックをリセット
    consoleSpy.mockRestore();
  });
}); 