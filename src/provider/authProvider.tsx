'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * 認証用セッションのプロバイダーのプロパティ
 */
type Props = {
  children: ReactNode;
};

/**
 * 認証用セッションのプロバイダー
 * @param children 子要素
 * @returns プロバイダー
 */
export function AuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 