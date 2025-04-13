import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '@/components/common/layout/Footer';
import { useSession } from 'next-auth/react';

// モックの作成
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('Footer', () => {
  beforeEach(() => {
    // モックの初期化
    jest.clearAllMocks();
  });

  it('非認証状態では、アカウントセクションが表示されること', () => {
    // 非認証状態をモック
    (useSession as jest.Mock).mockReturnValue({
      status: 'unauthenticated',
      data: null,
    });

    render(<Footer />);
    
    // 基本的なフッターの内容が表示されていることを確認
    expect(screen.getByText('AI Meal Coach')).toBeInTheDocument();
    expect(screen.getByText(/あなたの健康的な食生活をAIでサポートするサービスです/)).toBeInTheDocument();
    
    // リンクセクションが表示されていることを確認
    expect(screen.getByText('リンク')).toBeInTheDocument();
    expect(screen.getByText('機能紹介')).toBeInTheDocument();
    expect(screen.getByText('よくある質問')).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('利用規約')).toBeInTheDocument();
    
    // アカウントセクションが表示されていることを確認
    expect(screen.getByText('アカウント')).toBeInTheDocument();
    expect(screen.getByText('新規登録')).toBeInTheDocument();
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    
    // 現在の年が表示されていることを確認
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} AI Meal Coach. All rights reserved.`)).toBeInTheDocument();
  });

  it('認証状態では、アカウントセクションが表示されないこと', () => {
    // 認証状態をモック
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User' } },
    });

    render(<Footer />);
    
    // 基本的なフッターの内容が表示されていることを確認
    expect(screen.getByText('AI Meal Coach')).toBeInTheDocument();
    expect(screen.getByText(/あなたの健康的な食生活をAIでサポートするサービスです/)).toBeInTheDocument();
    
    // リンクセクションが表示されていることを確認
    expect(screen.getByText('リンク')).toBeInTheDocument();
    expect(screen.getByText('機能紹介')).toBeInTheDocument();
    
    // アカウントセクションが表示されていないことを確認
    expect(screen.queryByText('アカウント')).not.toBeInTheDocument();
    expect(screen.queryByText('新規登録')).not.toBeInTheDocument();
    expect(screen.queryByText('ログイン')).not.toBeInTheDocument();
  });

  it('現在の年が著作権表示に反映されていること', () => {
    (useSession as jest.Mock).mockReturnValue({
      status: 'unauthenticated',
      data: null,
    });
    
    // useEffectの中で現在時刻が参照されるため、レンダリング前に直接年を上書き
    const realGetFullYear = Date.prototype.getFullYear;
    Date.prototype.getFullYear = jest.fn(() => 2025);
    
    render(<Footer />);
    
    // 2025年が表示されていることを確認
    expect(screen.getByText('© 2025 AI Meal Coach. All rights reserved.')).toBeInTheDocument();
    
    // モックを元に戻す
    Date.prototype.getFullYear = realGetFullYear;
  });
}); 