/**
 * ユーザー登録APIのテスト
 */
import { POST } from '@/app/api/auth/register/route';
import { hash } from 'bcryptjs';

// bcryptjsをモック
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

// zodをモック
jest.mock('@/lib/types', () => {
  return {
    registerSchema: {
      safeParse: (data) => {
        // 名前がない場合はエラー
        if (!data.name) {
          return {
            success: false,
            error: {
              errors: [{ message: '名前を入力してください' }]
            }
          };
        }
        // 有効なデータの場合は成功
        return {
          success: true,
          data
        };
      }
    }
  };
});

// mongodbをモック
jest.mock('@/lib/utils/mongodb', () => {
  // モックコレクション作成
  const mockCollection = {
    findOne: jest.fn(),
    insertOne: jest.fn()
  };
  
  // モックDB接続を返す
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  
  return {
    connectToDatabase: jest.fn().mockResolvedValue({
      db: mockDb
    })
  };
});

// MongoDBモジュールを直接インポート
import * as mongodb from '@/lib/utils/mongodb';

describe('ユーザー登録API', () => {
  let mockDb;
  let mockCollection;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // モックの再設定
    mockCollection = {
      findOne: jest.fn().mockResolvedValue(null),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-user-id' })
    };
    
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    // connectToDatabaseのモック実装を上書き
    mongodb.connectToDatabase.mockResolvedValue({
      db: mockDb
    });
  });
  
  it('有効なデータで新しいユーザーを登録できること', async () => {
    const validUserData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };
    
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validUserData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    // パスワードがハッシュ化されたことを確認
    expect(hash).toHaveBeenCalledWith(validUserData.password, 12);
    
    // ユーザー登録が実行されたことを確認
    expect(mockDb.collection).toHaveBeenCalledWith('users');
    expect(mockCollection.insertOne).toHaveBeenCalled();
  });
  
  it('無効なデータで400エラーを返すこと', async () => {
    const invalidUserData = {
      // 名前が欠けている
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };
    
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidUserData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('名前を入力してください');
  });
  
  it('すでに登録されているメールアドレスで400エラーを返すこと', async () => {
    // メールアドレスが既に存在するケースをモック
    mockCollection.findOne.mockResolvedValueOnce({
      _id: 'existing-user-id',
      name: '既存ユーザー',
      email: 'test@example.com'
    });
    
    const existingUserData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };
    
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(existingUserData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('このメールアドレスは既に登録されています');
  });
  
  it('データベースエラー時は500エラーを返すこと', async () => {
    // データベースエラーをモック
    mockCollection.insertOne.mockRejectedValueOnce(
      new Error('データベース接続エラー')
    );
    
    const validUserData = {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };
    
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validUserData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('サーバーエラーが発生しました');
  });
}); 