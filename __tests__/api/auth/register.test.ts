/**
 * ユーザー登録APIテスト
 */
import { POST } from '@/app/api/auth/register/route';

// bcryptjsをモック
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password')
}));

// mongodbをモック
jest.mock('@/lib/utils/mongodb', () => {
  // 重複チェック用のフラグ
  let emailExists = false;
  
  // モック関数を返す
  return {
    connectToDatabase: jest.fn().mockImplementation(() => {
      return {
        db: {
          collection: jest.fn().mockImplementation(() => {
            return {
              findOne: jest.fn().mockImplementation(({ email }) => {
                if (email === 'duplicate@example.com' || emailExists) {
                  return { _id: 'existingId', email };
                }
                return null;
              }),
              insertOne: jest.fn().mockImplementation(() => {
                emailExists = true; // 後続のテストで重複エラーをシミュレート
                return { insertedId: 'new_user_id' };
              })
            };
          })
        }
      };
    })
  };
});

describe('ユーザー登録API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('有効なデータで正常にユーザーを登録できること', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    };

    const response = await POST(mockRequest as unknown as Request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      success: true,
      message: 'ユーザー登録が完了しました',
      userId: 'new_user_id'
    });
  });

  it('無効なデータでバリデーションエラーが返ること', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: '',
        email: 'invalid-email',
        password: 'short',
        confirmPassword: 'nomatch'
      })
    };

    const response = await POST(mockRequest as unknown as Request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBeDefined();
  });

  it('既存のメールアドレスで重複エラーが返ること', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: 'テストユーザー',
        email: 'duplicate@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    };

    const response = await POST(mockRequest as unknown as Request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('このメールアドレスは既に登録されています');
  });

  it('例外発生時にサーバーエラーが返ること', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('テストエラー'))
    };

    const response = await POST(mockRequest as unknown as Request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('サーバーエラーが発生しました');
  });
}); 