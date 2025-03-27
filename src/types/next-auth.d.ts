import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * セッションの型を拡張して、ユーザーIDを含めるようにします
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  /**
   * ユーザーの型を拡張して、IDを含めるようにします
   */
  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWTトークンの型を拡張して、ユーザーIDを含めるようにします
   */
  interface JWT {
    id: string;
  }
} 