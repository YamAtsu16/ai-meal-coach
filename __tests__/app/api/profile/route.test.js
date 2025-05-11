/**
 * プロフィールAPIのテスト
 */
import { GET, POST } from '@/app/api/profile/route';
import * as nextAuth from 'next-auth';
import * as mongodb from '@/lib/utils/mongodb';

// next-authをモック
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// mongodbをモック
jest.mock('@/lib/utils/mongodb', () => {
  // モックコレクション作成
  const mockCollection = {
    findOne: jest.fn(),
    updateOne: jest.fn()
  };
  
  // モックDB接続を返す
  return {
    connectToDatabase: jest.fn().mockResolvedValue({
      db: {
        collection: jest.fn().mockReturnValue(mockCollection)
      }
    })
  };
});

// NextResponseをモック
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: (body, options) => {
        return {
          status: options?.status || 200,
          json: async () => body,
          headers: new Map()
        };
      }
    }
  };
});

describe('プロフィールAPI', () => {
  let mockDb;
  let mockCollection;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // モックの再設定
    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn()
    };
    
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    // connectToDatabaseのモック実装を上書き
    mongodb.connectToDatabase.mockResolvedValue({
      db: mockDb
    });
    
    // モックの初期設定
    mockCollection.findOne.mockImplementation((query) => {
      if (query.email === 'test@example.com') {
        return Promise.resolve({
          _id: '123456789012',
          email: 'test@example.com',
          name: 'テストユーザー',
          height: 170,
          weight: 65,
          birthdate: '1990-01-01',
          gender: '男性',
          activityLevel: '普通',
          goal: {
            type: '減量',
            calories: 2000,
            protein: 120,
            fat: 60,
            carbs: 200
          }
        });
      } else if (query.userId === '123456789012') {
        // プロフィールデータを返す
        return Promise.resolve({
          userId: '123456789012',
          gender: '男性',
          birthDate: '1990-01-01',
          height: 170,
          weight: 70,
          activityLevel: '普通',
          goal: '減量',
          targetCalories: 2000,
          targetProtein: 120,
          targetFat: 60,
          targetCarbs: 200
        });
      } else if (query.email === 'empty@example.com') {
        // プロフィールが存在するがデータなし
        return Promise.resolve({
          _id: '223456789012',
          email: 'empty@example.com',
          name: 'データなしユーザー'
        });
      } else if (query.email === 'notfound@example.com') {
        // ユーザーが存在しないケース
        return Promise.resolve(null);
      } else if (query.email === 'error@example.com') {
        // エラーを発生させるケース
        return Promise.reject(new Error('データベース接続エラー'));
      }
      return Promise.resolve(null);
    });
    
    // 認証セッションのモック
    nextAuth.getServerSession.mockImplementation(() => {
      return Promise.resolve({
        user: {
          email: 'test@example.com',
          name: 'テストユーザー'
        }
      });
    });
    
    // updateOneのモック
    mockCollection.updateOne.mockImplementation((query) => {
      if (query.email === 'error@example.com') {
        return Promise.reject(new Error('データベース接続エラー'));
      } else if (query.email === 'notfound@example.com') {
        return Promise.resolve({ matchedCount: 0 });
      } else {
        return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
      }
    });
  });
  
  describe('GET /api/profile', () => {
    it('認証済みユーザーのプロフィールを取得できること', async () => {
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        userId: '123456789012',
        gender: '男性',
        birthDate: '1990-01-01',
        height: 170,
        weight: 70,
        activityLevel: '普通',
        goal: '減量',
        targetCalories: 2000,
        targetProtein: 120,
        targetFat: 60,
        targetCarbs: 200
      });
      
      // 正しいコレクションが参照されたことを確認
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockDb.collection).toHaveBeenCalledWith('profiles');
    });
    
    it('プロフィールが存在しない場合は空のデータを返すこと', async () => {
      // 特定のテストケース用のモック実装を変更
      mockCollection.findOne
        .mockImplementationOnce((query) => {
          if (query.email === 'test@example.com') {
            return Promise.resolve({
              _id: '123456789012',
              name: 'テストユーザー',
              email: 'test@example.com'
            });
          }
          return Promise.resolve(null);
        })
        .mockImplementationOnce(() => {
          // プロフィールが見つからないケース
          return Promise.resolve(null);
        });
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        gender: undefined,
        birthDate: '',
        height: null,
        weight: null,
        activityLevel: undefined,
        goal: undefined,
        targetCalories: null,
        targetProtein: null,
        targetFat: null,
        targetCarbs: null
      });
    });
    
    it('認証されていない場合は401エラーを返すこと', async () => {
      // 認証失敗のモック
      nextAuth.getServerSession.mockResolvedValueOnce(null);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('認証が必要です');
    });
    
    it('ユーザーが見つからない場合は404エラーを返すこと', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('ユーザーが見つかりません');
    });
    
    it('データベースエラー時は500エラーを返すこと', async () => {
      mockCollection.findOne.mockRejectedValueOnce(
        new Error('データベース接続エラー')
      );
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('プロフィールの取得に失敗しました');
    });
  });
  
  describe('POST /api/profile', () => {
    it('プロフィールを更新できること', async () => {
      const newProfile = {
        gender: '男性',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        activityLevel: '活発',
        goal: '筋力増強',
        targetCalories: 2500,
        targetProtein: 150,
        targetFat: 70,
        targetCarbs: 250
      };
      
      const request = new Request('http://localhost:3000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      
      // 特定のテストケース用のモック実装を変更
      mockCollection.findOne
        .mockImplementationOnce((query) => {
          if (query.email === 'test@example.com') {
            return Promise.resolve({
              _id: '123456789012',
              name: 'テストユーザー',
              email: 'test@example.com'
            });
          }
          return Promise.resolve(null);
        })
        .mockImplementationOnce((query) => {
          if (query.userId === '123456789012') {
            return Promise.resolve({
              ...newProfile,
              userId: '123456789012'
            });
          }
          return Promise.resolve(null);
        });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        ...newProfile,
        userId: '123456789012'
      });
      
      // 正しいパラメータでupdateOneが呼ばれたことを確認
      expect(mockDb.collection).toHaveBeenCalledWith('profiles');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { userId: '123456789012' },
        {
          $set: expect.objectContaining({
            ...newProfile,
            userId: '123456789012',
            updatedAt: expect.any(Date)
          }),
          $setOnInsert: {
            createdAt: expect.any(Date)
          }
        },
        { upsert: true }
      );
    });
    
    it('認証されていない場合は401エラーを返すこと', async () => {
      // 認証失敗のモック
      nextAuth.getServerSession.mockResolvedValueOnce(null);
      
      const request = new Request('http://localhost:3000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('認証が必要です');
    });
    
    it('ユーザーが見つからない場合は404エラーを返すこと', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const request = new Request('http://localhost:3000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('ユーザーが見つかりません');
    });
    
    it('データベースエラー時は500エラーを返すこと', async () => {
      mockCollection.updateOne.mockRejectedValueOnce(
        new Error('データベース接続エラー')
      );
      
      const request = new Request('http://localhost:3000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('プロフィールの更新に失敗しました');
    });
  });
}); 