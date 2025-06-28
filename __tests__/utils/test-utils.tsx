import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider, ToastProvider } from '@/providers';
import userEvent from '@testing-library/user-event';

// カスタムレンダラー用のラッパー
interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * すべてのプロバイダーでラップするコンポーネント
 */
export const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
};

/**
 * プロバイダーでラップしたカスタムレンダラー
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: AllProviders,
      ...options,
    }),
  };
}

/**
 * 認証状態をモックするヘルパー関数
 */
export function setupAuthMock(isAuthenticated = false) {
  const useSessionMock = jest.requireMock('next-auth/react').useSession;
  useSessionMock.mockReturnValue({
    data: isAuthenticated ? {
      user: { name: 'Test User', email: 'test@example.com', id: 'test-user-id' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } : null,
    status: isAuthenticated ? 'authenticated' : 'unauthenticated',
  });
}

/**
 * フェッチモックのセットアップ
 */
export function setupFetchMock(response = {}, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  });
  
  return { fetch: global.fetch };
}

/**
 * ルーターモックのセットアップ
 */
export function setupRouterMock() {
  const routerMock = jest.requireMock('next/navigation').useRouter;
  const pushMock = jest.fn();
  const replaceMock = jest.fn();
  const refreshMock = jest.fn();
  
  routerMock.mockReturnValue({
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock,
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  });
  
  return { 
    router: routerMock(),
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock
  };
}

/**
 * 検索パラメータモックのセットアップ
 */
export function setupSearchParamsMock(params: Record<string, string> = {}) {
  const searchParamsMock = jest.requireMock('next/navigation').useSearchParams;
  
  searchParamsMock.mockReturnValue({
    get: jest.fn().mockImplementation((key: string) => params[key] || null),
    getAll: jest.fn().mockImplementation((key: string) => params[key] ? [params[key]] : []),
    has: jest.fn().mockImplementation((key: string) => key in params),
    forEach: jest.fn(),
    entries: jest.fn().mockReturnValue(Object.entries(params)),
    keys: jest.fn().mockReturnValue(Object.keys(params)),
    values: jest.fn().mockReturnValue(Object.values(params)),
    toString: jest.fn().mockReturnValue(
      Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')
    ),
  });
  
  return searchParamsMock();
} 