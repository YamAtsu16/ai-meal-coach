import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/app/layout';
import { AuthProvider, ToastProvider } from '@/providers';
import { Navigation } from '@/components/common/layout/Navigation';
import { Footer } from '@/components/common/layout/Footer';

// モック
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter-font',
  }),
}));

jest.mock('@/providers', () => ({
  AuthProvider: jest.fn(({ children }) => <div data-testid="auth-provider">{children}</div>),
  ToastProvider: jest.fn(({ children }) => <div data-testid="toast-provider">{children}</div>),
}));

jest.mock('@/components/common/layout/Navigation', () => ({
  Navigation: jest.fn(() => <div data-testid="navigation">ナビゲーション</div>),
}));

jest.mock('@/components/common/layout/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">フッター</div>),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しいHTML構造でレンダリングされること', () => {
    const testChild = <div data-testid="test-child">テスト子要素</div>;
    
    render(<RootLayout>{testChild}</RootLayout>);
    
    // HTML言語が日本語に設定されていること
    const html = document.querySelector('html');
    expect(html).toHaveAttribute('lang', 'ja');
    
    // bodyにInterフォントのクラスが適用されていること
    const body = document.querySelector('body');
    expect(body).toHaveClass('mock-inter-font');
    
    // 各コンポーネントが正しい順序で配置されていること
    const authProvider = screen.getByTestId('auth-provider');
    const toastProvider = screen.getByTestId('toast-provider');
    const navigation = screen.getByTestId('navigation');
    const footer = screen.getByTestId('footer');
    const testChildElement = screen.getByTestId('test-child');
    
    expect(authProvider).toBeInTheDocument();
    expect(toastProvider).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(testChildElement).toBeInTheDocument();
    
    // 子要素が正しく配置されていること
    expect(authProvider).toContainElement(toastProvider);
    expect(toastProvider).toContainElement(navigation);
    expect(toastProvider).toContainElement(footer);
    expect(screen.getByText('テスト子要素')).toBeInTheDocument();
  });

  it('各プロバイダーとコンポーネントが正しく呼び出されること', () => {
    const testChild = <div>テスト子要素</div>;
    
    render(<RootLayout>{testChild}</RootLayout>);
    
    // 各モックが呼び出されたことを確認
    expect(AuthProvider).toHaveBeenCalled();
    expect(ToastProvider).toHaveBeenCalled();
    expect(Navigation).toHaveBeenCalled();
    expect(Footer).toHaveBeenCalled();
  });

  it('メインコンテンツが適切なコンテナ内に配置されること', () => {
    const testChild = <div data-testid="test-child">テスト子要素</div>;
    
    render(<RootLayout>{testChild}</RootLayout>);
    
    // mainタグが存在し、適切なクラスが適用されていること
    const mainElement = document.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('container');
    expect(mainElement).toHaveClass('mx-auto');
    expect(mainElement).toHaveClass('px-4');
    expect(mainElement).toHaveClass('py-8');
    
    // 子要素がmainタグ内に配置されていること
    expect(mainElement).toContainElement(screen.getByTestId('test-child'));
  });

  it('最小高さが設定されたコンテナが存在すること', () => {
    render(<RootLayout>テスト</RootLayout>);
    
    // min-heightが設定されたdivが存在すること
    const minHeightContainer = document.querySelector('.min-h-screen');
    expect(minHeightContainer).toBeInTheDocument();
    expect(minHeightContainer).toHaveClass('pt-16');
  });
}); 