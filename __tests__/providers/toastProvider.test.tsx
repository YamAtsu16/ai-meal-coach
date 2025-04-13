/**
 * ToastProviderのテスト
 */
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/providers/toastProvider';
import '@testing-library/jest-dom';

// useToastを使用するテスト用コンポーネント
function TestComponent() {
  const { showToast } = useToast();
  
  return (
    <div>
      <button 
        onClick={() => showToast('成功メッセージ', 'success')}
        data-testid="success-button"
      >
        成功トースト表示
      </button>
      <button 
        onClick={() => showToast('エラーメッセージ', 'error')}
        data-testid="error-button"
      >
        エラートースト表示
      </button>
      <button 
        onClick={() => showToast('警告メッセージ', 'warning', 500)}
        data-testid="warning-button"
      >
        警告トースト表示（短時間）
      </button>
    </div>
  );
}

// タイマーをモック化
jest.useFakeTimers();

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('トーストを表示できること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByTestId('success-button'));
    
    expect(screen.getByText('成功メッセージ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });
  
  it('複数のトーストを表示できること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByTestId('success-button'));
    fireEvent.click(screen.getByTestId('error-button'));
    
    expect(screen.getByText('成功メッセージ')).toBeInTheDocument();
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
    expect(screen.getAllByRole('alert').length).toBe(2);
  });
  
  it('指定した時間後にトーストが消えること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByTestId('warning-button'));
    
    expect(screen.getByText('警告メッセージ')).toBeInTheDocument();
    
    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // トーストが消えていることを確認
    expect(screen.queryByText('警告メッセージ')).not.toBeInTheDocument();
  });
  
  it('閉じるボタンをクリックするとトーストが消えること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByTestId('success-button'));
    
    expect(screen.getByText('成功メッセージ')).toBeInTheDocument();
    
    // 閉じるボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /閉じる/i }));
    
    // トーストが消えていることを確認
    expect(screen.queryByText('成功メッセージ')).not.toBeInTheDocument();
  });
  
  it('ToastProvider外でuseToastを使用するとエラーが発生すること', () => {
    // コンソールエラーを抑制
    const consoleError = console.error;
    console.error = jest.fn();
    
    // エラーが発生することを期待
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    // コンソールエラーを元に戻す
    console.error = consoleError;
  });
}); 