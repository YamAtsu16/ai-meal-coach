/**
 * ミドルウェアテスト
 */
import { middleware } from '@/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// getTokenをモック
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('Auth Middleware', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
    (getToken as jest.Mock).mockResolvedValue(null);
  });
  
  it('トップページで認証済みの場合、ホームページにリダイレクトすること', async () => {
    (getToken as jest.Mock).mockResolvedValue({ 
      name: 'Test User',
      email: 'test@example.com',
      sub: 'user_id'
    });
    
    const request = new NextRequest(new URL('http://localhost:3000/'));
    
    const response = await middleware(request);
    
    expect(response instanceof NextResponse).toBe(true);
    expect(response?.status).not.toBe(401);
    expect(response?.headers.get('location')).toBe('http://localhost:3000/home');
  });
  
  it('トップページで未認証の場合、リダイレクトしないこと', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    
    const response = await middleware(request);
    
    expect(response?.headers.get('location')).toBeNull();
  });
  
  it('認証不要のパスはスキップすること', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/login'));
    const nextSpy = jest.spyOn(NextResponse, 'next');
    
    await middleware(request);
    
    expect(nextSpy).toHaveBeenCalled();
    expect(getToken).not.toHaveBeenCalled();
  });
  
  it('保護されたパスで未認証の場合、ログインページにリダイレクトすること', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/home'));
    
    const response = await middleware(request);
    
    expect(getToken).toHaveBeenCalled();
    expect(response?.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fhome');
  });
  
  it('保護されたパスで認証済みの場合、アクセスを許可すること', async () => {
    (getToken as jest.Mock).mockResolvedValue({ 
      name: 'Test User',
      email: 'test@example.com',
      sub: 'user_id'
    });
    
    const request = new NextRequest(new URL('http://localhost:3000/home'));
    const nextSpy = jest.spyOn(NextResponse, 'next');
    
    await middleware(request);
    
    expect(getToken).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalled();
  });
  
  it('API保護パスで未認証の場合、ログインページにリダイレクトすること', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/api/meals'));
    
    const response = await middleware(request);
    
    expect(getToken).toHaveBeenCalled();
    expect(response?.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fmeals');
  });
}); 