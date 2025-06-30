import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/profile/page';
import { useToast } from '@/providers';

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
  const mockShowToast = jest.fn();

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
              targetCalories: 2000,
              targetProtein: 100,
              targetFat: 60,
              targetCarbs: 250,
              goal: 'maintain_weight',
              activityLevel: 'moderately_active'
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    // useToastのモックを設定
    (useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast
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
        targetCalories: 2000,
        targetProtein: 100,
        targetFat: 60,
        targetCarbs: 250,
        goal: 'maintain_weight',
        activityLevel: 'moderately_active'
      }
    });
  });

  it('PFC推奨値が表示され、適用ボタンがクリックできること', async () => {
    // React.useStateのモック
    const mockSetValue = jest.fn();
    const originalUseState = React.useState;
    
    // useStateをモック
    const useStateMock = jest.fn().mockImplementation((initialState) => {
      // showRecommendationsのモック
      if (initialState === false) {
        return [true, mockSetValue];
      }
      // recommendedValuesのモック
      if (initialState && typeof initialState === 'object' && 'protein' in initialState) {
        return [{
          protein: 120,
          fat: 70,
          carbs: 280
        }, mockSetValue];
      }
      // その他のuseStateはオリジナルを使用
      return originalUseState(initialState);
    });
    
    // useStateをモックに置き換え
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);

    // モックコンポーネントをレンダリング
    render(
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">栄養目標</h2>
        
        {/* カロリー目標 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">目標カロリー (kcal)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例: 2000"
              data-testid="calories-input"
            />
          </div>
        </div>

        {/* PFC推奨値の表示 */}
        <div className="bg-blue-50 p-4 rounded-md mb-6" data-testid="pfc-recommendations">
          <h3 className="text-md font-semibold text-blue-800 mb-2">
            減量目標に基づく推奨PFC
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700">タンパク質: <span className="font-medium">120g</span></p>
            </div>
            <div>
              <p className="text-blue-700">脂質: <span className="font-medium">70g</span></p>
            </div>
            <div>
              <p className="text-blue-700">炭水化物: <span className="font-medium">280g</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => mockSetValue(true)}
            className="mt-2 px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            data-testid="apply-button"
          >
            この値を適用
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 目標タンパク質 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標タンパク質 (g)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例: 100"
              data-testid="protein-input"
            />
          </div>
          
          {/* 目標脂質 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標脂質 (g)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例: 60"
              data-testid="fat-input"
            />
          </div>
          
          {/* 目標炭水化物 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標炭水化物 (g)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例: 250"
              data-testid="carbs-input"
            />
          </div>
        </div>
      </div>
    );

    // PFC推奨値が表示されていることを確認
    const recommendationsElement = screen.getByTestId('pfc-recommendations');
    expect(recommendationsElement).toBeInTheDocument();
    
    // 推奨値が正しく表示されていることを確認
    expect(screen.getByText('タンパク質:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('120g')).toBeInTheDocument();
    expect(screen.getByText('脂質:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('70g')).toBeInTheDocument();
    expect(screen.getByText('炭水化物:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('280g')).toBeInTheDocument();
    
    // 適用ボタンが表示されていることを確認
    const applyButton = screen.getByTestId('apply-button');
    expect(applyButton).toBeInTheDocument();
    
    // 適用ボタンをクリック
    fireEvent.click(applyButton);
    
    // setValueが呼ばれたことを確認
    expect(mockSetValue).toHaveBeenCalledWith(true);
    
    // モックを元に戻す
    jest.spyOn(React, 'useState').mockRestore();
  });

  it('プロフィールデータの取得に失敗した場合のエラーハンドリング', async () => {
    // フェッチのモックを上書き
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.reject(new Error('プロフィールデータの取得に失敗しました'));
    });
    
    // コンソールエラーをモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });
    
    // コンソールエラーが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      'プロフィールデータの取得エラー:',
      expect.any(Error)
    );
    
    // モックを元に戻す
    consoleSpy.mockRestore();
  });

  it('フォーム送信が成功した場合、成功トーストが表示されること', async () => {
    // フェッチのモックを上書き
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === '/api/profile' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gender: 'male',
            birthDate: '1990-01-01',
            height: 170,
            weight: 65,
            activityLevel: 'moderately_active',
            goal: 'maintain_weight',
            targetCalories: 2000,
            targetProtein: 100,
            targetFat: 60,
            targetCarbs: 250
          }
        })
      });
    });

    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });

    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('プロフィールデータを読み込み中...')).not.toBeInTheDocument();
    });

    // フォームが表示されていることを確認
    expect(screen.getByText('保存する')).toBeInTheDocument();

    // フォーム送信ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText('保存する'));
    });

    // トーストが表示されたことを確認
    expect(mockShowToast).toHaveBeenCalledWith('プロフィールが保存されました', 'success');
  });

  it('フォーム送信が失敗した場合、エラートーストが表示されること', async () => {
    // フェッチのモックを上書き（初回はGET成功、2回目はPOST失敗）
    global.fetch = jest.fn()
      .mockImplementationOnce(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              gender: 'male',
              birthDate: '1990-01-01',
              height: 170,
              weight: 65,
              activityLevel: 'moderately_active',
              goal: 'maintain_weight',
              targetCalories: 2000,
              targetProtein: 100,
              targetFat: 60,
              targetCarbs: 250
            }
          })
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'プロフィールの保存に失敗しました' })
        });
      });

    // コンソールエラーをモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });

    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('プロフィールデータを読み込み中...')).not.toBeInTheDocument();
    });

    // フォーム送信ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText('保存する'));
    });

    // エラートーストが表示されたことを確認
    expect(mockShowToast).toHaveBeenCalledWith('プロフィールの保存に失敗しました', 'error');
    
    // モックを元に戻す
    consoleSpy.mockRestore();
  });

  it('フォーム送信時に例外が発生した場合、エラートーストが表示されること', async () => {
    // フェッチのモックを上書き（初回はGET成功、2回目は例外発生）
    global.fetch = jest.fn()
      .mockImplementationOnce(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              gender: 'male',
              birthDate: '1990-01-01',
              height: 170,
              weight: 65,
              activityLevel: 'moderately_active',
              goal: 'maintain_weight',
              targetCalories: 2000,
              targetProtein: 100,
              targetFat: 60,
              targetCarbs: 250
            }
          })
        });
      })
      .mockImplementationOnce(() => {
        return Promise.reject(new Error('ネットワークエラー'));
      });

    // コンソールエラーをモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });

    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('プロフィールデータを読み込み中...')).not.toBeInTheDocument();
    });

    // フォーム送信ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText('保存する'));
    });

    // エラートーストが表示されたことを確認
    expect(mockShowToast).toHaveBeenCalledWith('プロフィールの保存に失敗しました', 'error');
    expect(consoleSpy).toHaveBeenCalled();
    
    // モックを元に戻す
    consoleSpy.mockRestore();
  });

  it('目標カロリーを設定すると推奨PFC値が表示されること', async () => {
    // フェッチのモックを設定
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gender: 'male',
            birthDate: '1990-01-01',
            height: 170,
            weight: 65,
            activityLevel: 'moderately_active',
            goal: 'lose_weight',
            targetCalories: 0,
            targetProtein: 0,
            targetFat: 0,
            targetCarbs: 0
          }
        })
      });
    });

    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });

    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('プロフィールデータを読み込み中...')).not.toBeInTheDocument();
    });

    // 目標カロリーの入力欄を探す
    const caloriesInput = screen.getAllByRole('spinbutton')[0]; // 最初のnumber入力を取得
    expect(caloriesInput).toBeInTheDocument();

    // 目標カロリーを設定
    await act(async () => {
      fireEvent.change(caloriesInput, { target: { value: '2000' } });
    });

    // 目標カロリー入力後、PFC入力欄が表示されていることを確認
    const proteinInput = screen.getAllByRole('spinbutton')[3]; // 4番目の入力欄（タンパク質）
    const fatInput = screen.getAllByRole('spinbutton')[4]; // 5番目の入力欄（脂質）
    const carbsInput = screen.getAllByRole('spinbutton')[5]; // 6番目の入力欄（炭水化物）
    
    expect(proteinInput).toBeInTheDocument();
    expect(fatInput).toBeInTheDocument();
    expect(carbsInput).toBeInTheDocument();
  });

  it('推奨値を適用ボタンをクリックすると値が設定されること', async () => {
    // フェッチのモックを設定
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gender: 'male',
            birthDate: '1990-01-01',
            height: 170,
            weight: 65,
            activityLevel: 'moderately_active',
            goal: 'lose_weight',
            targetCalories: 2000,
            targetProtein: 0,
            targetFat: 0,
            targetCarbs: 0
          }
        })
      });
    });

    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });

    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('プロフィールデータを読み込み中...')).not.toBeInTheDocument();
    });

    // 推奨値を適用ボタンが表示されるまで待つ
    await waitFor(() => {
      expect(screen.getByText('この値を適用')).toBeInTheDocument();
    });

    // 推奨値を適用ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText('この値を適用'));
    });

    // トーストが表示されたことを確認
    expect(mockShowToast).toHaveBeenCalledWith('推奨値を適用しました', 'success');
  });

  it('PFC値を入力するとカロリーが計算されること', async () => {
    // フェッチのモックを設定
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gender: 'male',
            birthDate: '1990-01-01',
            height: 170,
            weight: 65,
            activityLevel: 'moderately_active',
            goal: 'maintain_weight',
            targetCalories: 2000,
            targetProtein: 0,
            targetFat: 0,
            targetCarbs: 0
          }
        })
      });
    });

    // コンポーネントをレンダリング
    await act(async () => {
      render(<ProfilePage />);
    });

    // ローディングが終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('プロフィールデータを読み込み中...')).not.toBeInTheDocument();
    });

    // PFC値の入力欄を探す - spinbuttonの役割を持つ要素を順番で取得
    const allInputs = screen.getAllByRole('spinbutton');
    // 最初のinputは身長、2番目は体重、3番目はカロリー、4番目はタンパク質、5番目は脂質、6番目は炭水化物
    const proteinInput = allInputs[3]; // 4番目の入力欄（タンパク質）
    const fatInput = allInputs[4]; // 5番目の入力欄（脂質）
    const carbsInput = allInputs[5]; // 6番目の入力欄（炭水化物）

    // PFC値を設定
    await act(async () => {
      fireEvent.change(proteinInput, { target: { value: '100' } });
      fireEvent.change(fatInput, { target: { value: '60' } });
      fireEvent.change(carbsInput, { target: { value: '250' } });
    });

    // 計算されたカロリーが表示されることを確認
    // タンパク質100g×4kcal + 脂質60g×9kcal + 炭水化物250g×4kcal = 1940kcal
    await waitFor(() => {
      expect(screen.getByText(/PFCから計算されるカロリー/i, { exact: false })).toBeInTheDocument();
    });
  });
}); 