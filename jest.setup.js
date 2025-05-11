import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
import { Request, Response } from 'node-fetch';

// グローバルオブジェクトに設定
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Request = Request;
global.Response = Response;

// API用にJSONSerializerを設定
Object.defineProperty(Response.prototype, 'json', {
  value: async function() {
    return JSON.parse(await this.text());
  }
});

// Next.jsのNextResponseとNextRequestをモック
jest.mock('next/server', () => {
  // スパイの作成
  const nextSpy = jest.fn();
  const redirectSpy = jest.fn();
  
  // NextResponseクラスを実装
  class MockNextResponse {
    constructor(data, options = {}) {
      this.status = options.status || 200;
      this.data = data;
      this.headers = new Map();
    }

    static json(data, options = {}) {
      return new MockNextResponse(data, options);
    }

    static redirect(url) {
      redirectSpy(url);
      const response = new MockNextResponse(null, { status: 302 });
      response.headers.set('location', url.toString());
      return response;
    }

    static next() {
      nextSpy();
      return new MockNextResponse(null);
    }

    static rewrite(url) {
      const response = new MockNextResponse(null);
      response.headers.set('x-middleware-rewrite', url.toString());
      return response;
    }

    async json() {
      return this.data;
    }
  }
  
  // NextRequestのモックを追加
  class MockNextRequest {
    constructor(input, init = {}) {
      // 入力が完全に欠けている場合のデフォルトURL
      const defaultUrl = 'http://localhost:3000';
      
      // URLの正規化
      let normalizedInput;
      if (typeof input === 'string' && input) {
        normalizedInput = input;
      } else if (input instanceof URL) {
        normalizedInput = input.toString();
      } else if (input && typeof input.url === 'string' && input.url) {
        normalizedInput = input.url;
      } else {
        normalizedInput = defaultUrl;
      }
      
      this.url = normalizedInput;
      this.headers = new Headers(init?.headers || {});
      this.method = init?.method || 'GET';
      
      // nextUrlを常に有効なURLオブジェクトにする
      try {
        this.nextUrl = new URL(normalizedInput);
      } catch {
        // 無効なURLの場合はデフォルト値を使用
        this.nextUrl = new URL(defaultUrl);
      }
      
      this.cookies = { 
        get: jest.fn().mockReturnValue(null), 
        getAll: jest.fn().mockReturnValue([]), 
        set: jest.fn(), 
        delete: jest.fn(),
        has: jest.fn().mockReturnValue(false)
      };
      
      this.geo = { 
        country: null, 
        city: null, 
        region: null 
      };
      
      this.ip = null;
    }

    clone() {
      return new MockNextRequest(this.url, {
        method: this.method,
        headers: this.headers
      });
    }

    json() {
      return Promise.resolve({});
    }

    text() {
      return Promise.resolve('');
    }
  }
  
  // jestのspyOnを上書き
  const originalSpyOn = jest.spyOn;
  jest.spyOn = function(object, methodName) {
    if (object === MockNextResponse && methodName === 'next') {
      return nextSpy;
    }
    if (object === MockNextResponse && methodName === 'redirect') {
      return redirectSpy;
    }
    return originalSpyOn(object, methodName);
  };
  
  return {
    NextResponse: MockNextResponse,
    NextRequest: MockNextRequest
  };
});

// getTokenのモックを設定
jest.mock('next-auth/jwt', () => {
  const getTokenMock = jest.fn().mockImplementation(async () => null);
  return {
    getToken: getTokenMock
  };
});

// MongoDBのObjectIdをモック
jest.mock('mongodb', () => {
  class MockObjectId {
    constructor(id) {
      this.id = id;
    }
    
    toString() {
      return this.id || '';
    }
    
    toHexString() {
      return this.id || '';
    }
  }
  
  return {
    ObjectId: MockObjectId
  };
}); 