// Jest-domの拡張型定義
// @ts-expect-error - jest-domは型定義を提供しますが、一部の拡張マッチャーが不足している場合があります
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Expect {
      toBeInTheDocument(): void;
      toHaveClass(className: string): void;
    }
  }
}

export {}; 