import { useSession as originalUseSession } from 'next-auth/react';

// Next Auth のモック
export const useSession = jest.fn(originalUseSession);
export const getSession = jest.fn(() => {
  return Promise.resolve({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
});

export const signIn = jest.fn(() => {
  return Promise.resolve({ ok: true, error: null });
});

export const signOut = jest.fn(() => {
  return Promise.resolve(true);
});

export const getServerSession = jest.fn(() => {
  return Promise.resolve({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}); 