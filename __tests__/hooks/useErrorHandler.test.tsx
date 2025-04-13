/**
 * useErrorHandlerフックのテスト
 */
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '@/lib/hooks';
import { ReactNode } from 'react';

// showToastをモック化
const mockShowToast = jest.fn();

// ToastProviderのモック
jest.mock('@/providers', () => {
  const MockToastProvider = ({ children }: { children: ReactNode }) => children;
  MockToastProvider.displayName = 'MockToastProvider';
  
  return {
    useToast: () => ({ showToast: mockShowToast }),
    ToastProvider: MockToastProvider
  };
});

// コンソールのエラーをモック化
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// テストの前にモックをリセット
beforeEach(() => {
  mockShowToast.mockClear();
  (console.error as jest.Mock).mockClear();
});

describe('useErrorHandler', () => {
  it('エラーメッセージをセットすること', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError('テストエラー');
    });
    
    expect(result.current.error).toBe('テストエラー');
    expect(mockShowToast).toHaveBeenCalledWith('テストエラー', 'error');
    expect(console.error).toHaveBeenCalled();
  });
  
  it('Error型のエラーを処理できること', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('エラーオブジェクト');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(result.current.error).toBe('エラーオブジェクト');
    expect(mockShowToast).toHaveBeenCalledWith('エラーオブジェクト', 'error');
  });
  
  it('未知のエラー型をデフォルトメッセージで処理できること', () => {
    const { result } = renderHook(() => useErrorHandler());
    const unknownError = { code: 500 };
    
    act(() => {
      result.current.handleError(unknownError);
    });
    
    expect(result.current.error).toBe('予期せぬエラーが発生しました');
    expect(mockShowToast).toHaveBeenCalledWith('予期せぬエラーが発生しました', 'error');
  });
  
  it('カスタムデフォルトメッセージを受け入れること', () => {
    const { result } = renderHook(() => useErrorHandler());
    const unknownError = { code: 500 };
    
    act(() => {
      result.current.handleError(unknownError, 'カスタムエラーメッセージ');
    });
    
    expect(result.current.error).toBe('カスタムエラーメッセージ');
    expect(mockShowToast).toHaveBeenCalledWith('カスタムエラーメッセージ', 'error');
  });
  
  it('エラーをクリアできること', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError('テストエラー');
    });
    
    expect(result.current.error).toBe('テストエラー');
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
  
  it('JSONレスポンスからエラーメッセージを抽出できること', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json')
      },
      json: jest.fn().mockResolvedValue({ error: 'APIエラー' }),
      status: 400,
      text: jest.fn()
    } as unknown as Response;
    
    let extractedError;
    await act(async () => {
      extractedError = await result.current.extractErrorFromResponse(mockResponse);
    });
    
    expect(extractedError).toBe('APIエラー');
  });
  
  it('テキストレスポンスからエラーメッセージを抽出できること', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/plain')
      },
      json: jest.fn().mockRejectedValue(new Error('JSONではありません')),
      text: jest.fn().mockResolvedValue('プレーンテキストエラー'),
      status: 500
    } as unknown as Response;
    
    let extractedError;
    await act(async () => {
      extractedError = await result.current.extractErrorFromResponse(mockResponse);
    });
    
    expect(extractedError).toBe('プレーンテキストエラー');
  });
}); 