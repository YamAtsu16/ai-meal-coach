// Next.jsのnavigationモジュールをモック
export const useRouter = jest.fn().mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
});

export const usePathname = jest.fn().mockReturnValue('/');

export const useSearchParams = jest.fn().mockReturnValue({
  get: jest.fn().mockReturnValue(null),
  getAll: jest.fn().mockReturnValue([]),
  has: jest.fn().mockReturnValue(false),
  forEach: jest.fn(),
  entries: jest.fn().mockReturnValue([]),
  keys: jest.fn().mockReturnValue([]),
  values: jest.fn().mockReturnValue([]),
  toString: jest.fn().mockReturnValue(''),
});

export const useParams = jest.fn().mockReturnValue({});

export const redirect = jest.fn();

export const notFound = jest.fn(); 