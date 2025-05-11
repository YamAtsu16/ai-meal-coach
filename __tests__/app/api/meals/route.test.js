/**
 * 食事記録APIのテスト
 */
import { GET, POST, PUT } from '@/app/api/meals/route';
import { getToken } from 'next-auth/jwt';
import * as mongodb from '@/lib/utils/mongodb';

// MongoDB ObjectIdのモック
const ObjectId = jest.fn().mockImplementation((id) => {
  return {
    id,
    toString: () => id || '',
    toHexString: () => id || ''
  };
});

// next-auth/jwtをモック
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}));

// mongodbをモック
jest.mock('@/lib/utils/mongodb', () => {
  // モックコレクション作成
  const mockCollection = {
    find: jest.fn(() => mockCollection),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    sort: jest.fn(() => mockCollection),
    toArray: jest.fn()
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

describe('食事記録API', () => {
  let mockDb;
  let mockCollection;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // モックの再設定
    mockCollection = {
      find: jest.fn(() => mockCollection),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      sort: jest.fn(() => mockCollection),
      toArray: jest.fn()
    };
    
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    // connectToDatabaseのモック実装を上書き
    mongodb.connectToDatabase.mockResolvedValue({
      db: mockDb
    });
    
    // モックの設定
    mockCollection.toArray.mockResolvedValue([
      {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
        userId: 'user123',
        mealType: '朝食',
        date: new Date('2023-01-01T00:00:00.000Z'),
        items: [
          {
            foodId: 'food_123',
            label: 'りんご',
            quantity: 1,
            nutrients: {
              ENERC_KCAL: 52,
              PROCNT: 0.26,
              FAT: 0.17,
              CHOCDF: 13.81
            }
          }
        ]
      }
    ]);
    
    mockCollection.findOne.mockResolvedValue({
      _id: new ObjectId('60d21b4667d0d8992e610c85'),
      userId: 'user123',
      mealType: '朝食',
      date: new Date('2023-01-01T00:00:00.000Z'),
      items: [
        {
          foodId: 'food_123',
          label: 'りんご',
          quantity: 1,
          nutrients: {
            ENERC_KCAL: 52,
            PROCNT: 0.26,
            FAT: 0.17,
            CHOCDF: 13.81
          }
        }
      ]
    });
    
    mockCollection.insertOne.mockResolvedValue({
      insertedId: new ObjectId('60d21b4667d0d8992e610c85')
    });
    
    mockCollection.findOneAndUpdate.mockResolvedValue({
      _id: new ObjectId('60d21b4667d0d8992e610c85'),
      userId: 'user123',
      mealType: '昼食', // 更新された値
      date: new Date('2023-01-01T00:00:00.000Z'),
      items: [
        {
          foodId: 'food_456',
          label: 'バナナ', // 更新された値
          quantity: 2,
          nutrients: {
            ENERC_KCAL: 89,
            PROCNT: 1.09,
            FAT: 0.33,
            CHOCDF: 22.84
          }
        }
      ]
    });
    
    // 認証トークンのモック
    getToken.mockResolvedValue({
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    });
  });
  
  describe('GET /api/meals', () => {
    it('認証済みユーザーの食事記録を取得できること', async () => {
      const request = new Request('http://localhost:3000/api/meals');
      
      const response = await GET(request);
      const data = await response.json();
      
      // レスポンスのチェック
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].userId).toBe('user123');
      expect(data[0].mealType).toBe('朝食');
      
      // 正しいコレクションが参照されたことを確認
      expect(mockDb.collection).toHaveBeenCalledWith('meals');
      
      // findが適切なパラメータで呼ばれたことを確認
      expect(mockCollection.find).toHaveBeenCalledWith({ userId: 'user123' });
      
      // 日付でソートされたことを確認
      expect(mockCollection.sort).toHaveBeenCalledWith({ date: -1 });
    });
    
    it('認証されていない場合は401エラーを返すこと', async () => {
      // 認証失敗のモック
      getToken.mockResolvedValueOnce(null);
      
      const request = new Request('http://localhost:3000/api/meals');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('認証エラー');
    });
    
    it('データベースエラー時は500エラーを返すこと', async () => {
      // データベースエラーをモック
      mockCollection.toArray.mockRejectedValueOnce(
        new Error('データベース接続エラー')
      );
      
      const request = new Request('http://localhost:3000/api/meals');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('食事記録の取得に失敗しました');
    });
  });
  
  describe('POST /api/meals', () => {
    it('新しい食事記録を作成できること', async () => {
      const newMeal = {
        mealType: '朝食',
        date: '2023-01-01T00:00:00.000Z',
        items: [
          {
            foodId: 'food_123',
            label: 'りんご',
            quantity: 1,
            nutrients: {
              ENERC_KCAL: 52,
              PROCNT: 0.26,
              FAT: 0.17,
              CHOCDF: 13.81
            }
          }
        ]
      };
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal)
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      // レスポンスのチェック
      expect(response.status).toBe(200);
      expect(data._id).toBeDefined();
      expect(data.userId).toBe('user123');
      expect(data.mealType).toBe('朝食');
      
      // 正しいデータでinsertOneが呼ばれたことを確認
      expect(mockDb.collection).toHaveBeenCalledWith('meals');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        mealType: '朝食',
        items: expect.any(Array)
      }));
    });
    
    it('認証されていない場合は401エラーを返すこと', async () => {
      // 認証失敗のモック
      getToken.mockResolvedValueOnce(null);
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('認証エラー');
    });
    
    it('データベースエラー時は500エラーを返すこと', async () => {
      // データベースエラーをモック
      mockCollection.insertOne.mockRejectedValueOnce(
        new Error('データベース接続エラー')
      );
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: '朝食',
          date: '2023-01-01T00:00:00.000Z',
          items: []
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('保存に失敗しました');
    });
  });
  
  describe('PUT /api/meals', () => {
    it('既存の食事記録を更新できること', async () => {
      const updatedMeal = {
        id: '60d21b4667d0d8992e610c85',
        mealType: '昼食',
        date: '2023-01-01T00:00:00.000Z',
        items: [
          {
            foodId: 'food_456',
            label: 'バナナ',
            quantity: 2,
            nutrients: {
              ENERC_KCAL: 89,
              PROCNT: 1.09,
              FAT: 0.33,
              CHOCDF: 22.84
            }
          }
        ]
      };
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeal)
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      // レスポンスのチェック
      expect(response.status).toBe(200);
      expect(data.mealType).toBe('昼食');
      expect(data.items[0].label).toBe('バナナ');
      
      // 正しいデータでfindOneAndUpdateが呼ばれたことを確認
      expect(mockDb.collection).toHaveBeenCalledWith('meals');
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.objectContaining({ id: '60d21b4667d0d8992e610c85' }), userId: 'user123' },
        {
          $set: expect.objectContaining({
            mealType: '昼食',
            items: expect.any(Array),
            updatedAt: expect.any(Date)
          })
        },
        { returnDocument: 'after' }
      );
    });
    
    it('認証されていない場合は401エラーを返すこと', async () => {
      // 認証失敗のモック
      getToken.mockResolvedValueOnce(null);
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '60d21b4667d0d8992e610c85',
          mealType: '昼食',
          date: '2023-01-01T00:00:00.000Z',
          items: []
        })
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('認証エラー');
    });
    
    it('存在しない食事記録の場合は404エラーを返すこと', async () => {
      // 食事記録が見つからない場合をモック
      mockCollection.findOneAndUpdate.mockResolvedValueOnce(null);
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '60d21b4667d0d8992e610c86', // 存在しないID
          mealType: '昼食',
          date: '2023-01-01T00:00:00.000Z',
          items: []
        })
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('食事記録が見つかりません');
    });
    
    it('データベースエラー時は500エラーを返すこと', async () => {
      // データベースエラーをモック
      mockCollection.findOneAndUpdate.mockRejectedValueOnce(
        new Error('データベース接続エラー')
      );
      
      const request = new Request('http://localhost:3000/api/meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '60d21b4667d0d8992e610c85',
          mealType: '昼食',
          date: '2023-01-01T00:00:00.000Z',
          items: []
        })
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('更新に失敗しました');
    });
  });
}); 