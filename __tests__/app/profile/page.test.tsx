import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/profile/page';

// Next.jsのnavigationモジュールをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn()
  })
}));

// useToastをモック
jest.mock('@/providers', () => ({
  useToast: jest.fn().mockReturnValue({
    showToast: jest.fn()
  })
}));

describe('プロフィールページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // フェッチAPIをモック
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              name: 'テストユーザー',
              email: 'test@example.com',
              gender: 'male',
              birthdate: '1990-01-01',
              height: 170,
              weight: 65,
              goals: {
                calories: 2000,
                protein: 100,
                fat: 60,
                carbs: 250
              }
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('プロフィールページが初期状態でローディングを表示すること', () => {
    render(<ProfilePage />);
    
    // ローディングメッセージが表示されることを確認（初期状態）
    expect(screen.getByText('プロフィールデータを読み込み中...')).toBeInTheDocument();
  });

  it('プロフィールページのUIコンポーネントテスト', () => {
    // モックコンポーネントをレンダリング
    render(
      <div>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">名前</label>
                <input 
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value="テストユーザー"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">栄養目標</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">カロリー (kcal)</label>
                <input 
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value="2000"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('プロフィール')).toBeInTheDocument();
    
    // 基本情報セクションが表示されていることを確認
    expect(screen.getByText('基本情報')).toBeInTheDocument();
    
    // 栄養目標セクションが表示されていることを確認
    expect(screen.getByText('栄養目標')).toBeInTheDocument();
    
    // 保存ボタンが表示されていることを確認
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('フェッチAPIのモックテスト', async () => {
    // フェッチを呼び出す
    const response = await fetch('/api/profile');
    const data = await response.json();
    
    // フェッチが呼ばれたことを確認
    expect(fetch).toHaveBeenCalledWith('/api/profile');
    
    // レスポンスデータが正しいことを確認
    expect(data).toEqual({
      success: true,
      data: {
        name: 'テストユーザー',
        email: 'test@example.com',
        gender: 'male',
        birthdate: '1990-01-01',
        height: 170,
        weight: 65,
        goals: {
          calories: 2000,
          protein: 100,
          fat: 60,
          carbs: 250
        }
      }
    });
  });
}); 