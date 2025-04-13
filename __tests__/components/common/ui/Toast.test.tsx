/**
 * Toastコンポーネントのテスト
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast } from '@/components/common/ui/Toast';
import '@testing-library/jest-dom';

// タイマーをモック化
jest.useFakeTimers();

describe('Toast', () => {
  it('成功トーストを正しくレンダリングすること', () => {
    render(<Toast message="成功メッセージ" type="success" />);
    
    expect(screen.getByText('成功メッセージ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });
  
  it('エラートーストを正しくレンダリングすること', () => {
    render(<Toast message="エラーメッセージ" type="error" />);
    
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });
  
  it('警告トーストを正しくレンダリングすること', () => {
    render(<Toast message="警告メッセージ" type="warning" />);
    
    expect(screen.getByText('警告メッセージ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
  });
  
  it('情報トーストを正しくレンダリングすること', () => {
    render(<Toast message="情報メッセージ" type="info" />);
    
    expect(screen.getByText('情報メッセージ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });
  
  it('閉じるボタンをクリックすると消えること', () => {
    const handleClose = jest.fn();
    render(<Toast message="テストメッセージ" type="success" onClose={handleClose} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('指定した時間後に自動的に消えること', () => {
    const handleClose = jest.fn();
    render(<Toast message="テストメッセージ" type="success" duration={1000} onClose={handleClose} />);
    
    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
}); 