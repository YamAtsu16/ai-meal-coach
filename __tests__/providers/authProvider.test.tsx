/**
 * 認証プロバイダーのテスト
 */
import { render } from '@testing-library/react';
import { AuthProvider } from '@/providers/authProvider';
import { SessionProvider } from 'next-auth/react';
import '@testing-library/jest-dom';

// SessionProviderをモック
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    ...originalModule,
    SessionProvider: jest.fn(({ children }: { children: React.ReactNode }) => <div data-testid="session-provider">{children}</div>)
  };
});

describe('AuthProvider', () => {
  it('SessionProviderで子コンポーネントをラップしていること', () => {
    // テスト用の子コンポーネント
    const TestChild = () => <div data-testid="test-child">テスト子要素</div>;
    TestChild.displayName = 'TestChild';
    
    // AuthProviderをレンダリング
    const { getByTestId } = render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );
    
    // SessionProviderが呼び出されたことを確認
    expect(SessionProvider).toHaveBeenCalled();
    
    // SessionProvider内に子コンポーネントがレンダリングされていることを確認
    expect(getByTestId('session-provider')).toBeInTheDocument();
    expect(getByTestId('test-child')).toBeInTheDocument();
    expect(getByTestId('test-child').textContent).toBe('テスト子要素');
  });
}); 