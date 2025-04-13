// MongoDBクライアントのモック
export const MongoClient = jest.fn().mockImplementation(() => ({
  connect: jest.fn().mockResolvedValue(this),
  db: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    }),
  }),
}));

// コネクションのPromiseモック
const clientPromise = Promise.resolve({
  db: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    }),
  }),
});

export default clientPromise; 