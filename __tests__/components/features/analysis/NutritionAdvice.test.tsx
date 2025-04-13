import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NutritionAdvice from '@/components/features/analysis/NutritionAdvice';
import { ToastProvider } from '@/providers';

// handleErrorのモック関数
const mockHandleError = jest.fn();

// モックの作成
jest.mock('@/lib/hooks', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    error: null,
    clearError: jest.fn(),
    extractErrorFromResponse: jest.fn(),
  }),
}));

// fetchのモック
global.fetch = jest.fn();

describe('NutritionAdvice', () => {
  const mockDate = '2023-01-01';
  
  beforeEach(() => {
    // 各テスト前にモックをリセット
    (global.fetch as jest.Mock).mockReset();
    mockHandleError.mockReset();
  });

  it('初期状態で正しく表示されること', () => {
    render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンが表示されていることを確認
    expect(screen.getByText('分析を開始')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
    
    // 注意書きが表示されていることを確認
    expect(screen.getByText(/AI分析は参考情報です/)).toBeInTheDocument();
    expect(screen.getByText(/分析には最大30秒程度かかる場合があります/)).toBeInTheDocument();
    
    // 分析結果が表示されていないことを確認
    expect(screen.queryByText('分析結果')).not.toBeInTheDocument();
  });

  it('分析開始ボタンをクリックするとローディング状態になること', async () => {
    // fetchの解決を遅延させる
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンをクリック
    fireEvent.click(screen.getByText('分析を開始'));
    
    // ローディング状態になることを確認
    expect(screen.getByText('分析中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    
    // APIが正しいパラメータで呼び出されたことを確認
    expect(global.fetch).toHaveBeenCalledWith('/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: mockDate,
      }),
    });
  });

  it('分析結果が正常に取得できた場合、結果が表示されること', async () => {
    const mockAnalysisResult = '<p>あなたの栄養状態は良好です</p>';
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            result: mockAnalysisResult
          }
        })
      })
    );
    
    render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンをクリック
    fireEvent.click(screen.getByText('分析を開始'));
    
    // 分析結果が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('分析結果')).toBeInTheDocument();
    });
    
    // 分析結果の内容がレンダリングされていることを確認
    // dangerouslySetInnerHTMLで設定されるので、containerを使って確認
    const resultContainer = document.querySelector('.nutrition-analysis');
    expect(resultContainer?.innerHTML).toContain(mockAnalysisResult);
  });

  it('APIからエラーが返された場合、APIキー警告が表示されること', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          message: 'OpenAI APIキーが設定されていません'
        })
      })
    );
    
    render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンをクリック
    fireEvent.click(screen.getByText('分析を開始'));
    
    // APIキー警告が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('予期せぬエラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('お手数ですが、管理者に問い合わせてください。')).toBeInTheDocument();
    });
  });

  it('通常のAPIエラーの場合、エラーハンドラーが呼ばれること', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          message: '一般的なエラーメッセージ'
        })
      })
    );
    
    render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンをクリック
    fireEvent.click(screen.getByText('分析を開始'));
    
    // エラーハンドラーが呼ばれることを確認
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith('一般的なエラーメッセージ', '分析処理中にエラーが発生しました');
    });
  });

  it('ネットワークエラーの場合、適切にエラーハンドリングされること', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンをクリック
    fireEvent.click(screen.getByText('分析を開始'));
    
    // エラーハンドラーが呼ばれることを確認
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        '通信エラーが発生しました。ネットワーク接続を確認してください。'
      );
    });
  });

  it('日付が変更されると状態がリセットされること', async () => {
    // まず成功レスポンスを設定
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            result: '<p>テスト結果</p>'
          }
        })
      })
    );
    
    const { rerender } = render(
      <ToastProvider>
        <NutritionAdvice selectedDate={mockDate} />
      </ToastProvider>
    );
    
    // 分析開始ボタンをクリック
    fireEvent.click(screen.getByText('分析を開始'));
    
    // 分析結果が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('分析結果')).toBeInTheDocument();
    });
    
    // 日付を変更して再レンダリング
    rerender(
      <ToastProvider>
        <NutritionAdvice selectedDate="2023-01-02" />
      </ToastProvider>
    );
    
    // 分析結果が表示されなくなったことを確認
    expect(screen.queryByText('分析結果')).not.toBeInTheDocument();
  });
}); 