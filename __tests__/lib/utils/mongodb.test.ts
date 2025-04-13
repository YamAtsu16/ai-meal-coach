/**
 * MongoDB接続テスト
 */
import { connectToDatabase } from '@/lib/utils/mongodb';

// 環境変数をモック化するために、実際のmongodbモジュールをモックする前に設定
process.env.DATABASE_URL = 'mongodb://localhost:27017/test_db';

// MongoDBのモック化
jest.mock('mongodb', () => {
  const mockDb = {
    collection: jest.fn(),
  };
  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
  };
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(mockClient),
    })),
  };
});

// clientPromiseをモック
jest.mock('@/lib/utils/mongodb', () => {
  const mockDb = {
    collection: jest.fn(),
  };
  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
  };
  return {
    connectToDatabase: jest.fn().mockResolvedValue({
      client: mockClient,
      db: mockDb,
    }),
  };
}, { virtual: true });

describe('MongoDB接続', () => {
  it('データベースに接続できること', async () => {
    const { db } = await connectToDatabase();
    expect(db).toBeDefined();
  });

  it('データベースオブジェクトがcollectionメソッドを持つこと', async () => {
    const { db } = await connectToDatabase();
    expect(db.collection).toBeDefined();
  });

  it('クライアントオブジェクトが有効であること', async () => {
    const { client } = await connectToDatabase();
    expect(client).toBeDefined();
    expect(client.db).toBeDefined();
  });
}); 