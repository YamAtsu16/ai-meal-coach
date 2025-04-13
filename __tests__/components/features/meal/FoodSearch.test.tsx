/**
 * FoodSearchコンポーネントのテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FoodSearch } from '@/components/features/meal/FoodSearch';
import '@testing-library/jest-dom';
import * as ErrorHandler from '@/lib/hooks/useErrorHandler';

// fetchをモック
global.fetch = jest.fn() as jest.Mock;

// エラーハンドラーをモック
const mockHandleError = jest.fn();
jest.spyOn(ErrorHandler, 'useErrorHandler').mockImplementation(() => ({
  handleError: mockHandleError,
  error: null,
  clearError: jest.fn(),
  extractErrorFromResponse: jest.fn()
}));

describe('FoodSearch', () => {
  const mockOnSelect = jest.fn();
  
  // モックの検索結果
  const mockSearchResults = [
    {
      foodId: 'food1',
      label: 'りんご',
      nutrients: {
        ENERC_KCAL: 52,
        PROCNT: 0.3,
        FAT: 0.2,
        CHOCDF: 14
      }
    },
    {
      foodId: 'food2',
      label: 'バナナ',
      originalLabel: 'Banana',
      nutrients: {
        ENERC_KCAL: 89,
        PROCNT: 1.1,
        FAT: 0.3,
        CHOCDF: 23
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSearchResults
    });
  });

  it('検索フォームが表示されること', () => {
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    expect(screen.getByPlaceholderText('食品名を入力して検索...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
  });

  it('検索クエリを入力できること', () => {
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    expect(searchInput).toHaveValue('りんご');
  });

  it('検索ボタンをクリックすると検索APIが呼ばれること', async () => {
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    // 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    // APIが呼ばれることを確認（URLエンコードされた値で検証）
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/food\/search\?query=.+/),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json'
          })
        })
      );
    });
  });

  it('Enterキーで検索できること', async () => {
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    // Enterキーを押す
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    
    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/food\/search\?query=.+/),
        expect.any(Object)
      );
    });
  });

  it('検索結果が表示されること', async () => {
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    // 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    // 検索結果が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('りんご')).toBeInTheDocument();
      expect(screen.getByText('バナナ')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
  });

  it('検索結果をクリックすると選択イベントが発火すること', async () => {
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    // 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    // 検索結果が表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('りんご')).toBeInTheDocument();
    });
    
    // 検索結果をクリック
    fireEvent.click(screen.getByText('りんご'));
    
    // 選択イベントが発火することを確認
    expect(mockOnSelect).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('APIエラー時にエラーメッセージが表示されること', async () => {
    // fetchのモックを上書き
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => 'API Error'
    });
    
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    // 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  it('検索結果が空の場合にエラーメッセージが表示されること', async () => {
    // fetchのモックを上書き
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => []
    });
    
    render(<FoodSearch onSelect={mockOnSelect} />);
    
    // 検索クエリを入力
    const searchInput = screen.getByPlaceholderText('食品名を入力して検索...');
    fireEvent.change(searchInput, { target: { value: 'りんご' } });
    
    // 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        '「りんご」に一致する食品が見つかりませんでした',
        '検索結果なし'
      );
    });
  });
}); 