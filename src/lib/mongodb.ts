import { MongoClient } from 'mongodb';

// 環境変数のチェック
if (!process.env.DATABASE_URL) {
  throw new Error('環境変数 DATABASE_URL が設定されていません');
}

const uri = process.env.DATABASE_URL;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 開発環境では、グローバル変数を使用して接続を再利用する
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // 本番環境では、新しい接続を作成する
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// クライアントをエクスポート（NextAuth.js のMongoDBアダプター用）
export default clientPromise;

// 使いやすいデータベース接続関数
export async function connectToDatabase() {
  const client = await clientPromise;
  // 既存の環境変数からデータベース名を取得
  const dbName = new URL(uri).pathname.substring(1) || 'ai-meal-coach';
  const db = client.db(dbName);
  return { client, db };
} 