import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Pagination } from '@/components/common/layout/Pagination';

// Heroiconsのモック
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />,
}));

describe('Pagination', () => {
  it('総ページ数が1以下の場合は何も表示されないこと', () => {
    const onPageChange = jest.fn();
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />
    );
    
    // コンポーネントが何も表示していないことを確認
    expect(container.firstChild).toBeNull();
  });

  it('最初のページにいる場合、前のページボタンが無効になっていること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );
    
    // 前のページボタンが無効になっていることを確認
    const prevButton = screen.getByLabelText('前のページ');
    expect(prevButton).toBeDisabled();
    
    // 次のページボタンが有効であることを確認
    const nextButton = screen.getByLabelText('次のページ');
    expect(nextButton).not.toBeDisabled();
    
    // ページ番号が正しく表示されていることを確認
    expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('最後のページにいる場合、次のページボタンが無効になっていること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />
    );
    
    // 次のページボタンが無効になっていることを確認
    const nextButton = screen.getByLabelText('次のページ');
    expect(nextButton).toBeDisabled();
    
    // 前のページボタンが有効であることを確認
    const prevButton = screen.getByLabelText('前のページ');
    expect(prevButton).not.toBeDisabled();
    
    // ページ番号が正しく表示されていることを確認
    expect(screen.getByText('5')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('中間のページにいる場合、両方のナビゲーションボタンが有効であること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    
    // 両方のボタンが有効であることを確認
    const prevButton = screen.getByLabelText('前のページ');
    const nextButton = screen.getByLabelText('次のページ');
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    
    // 現在のページが強調表示されていることを確認
    expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page');
  });

  it('ページ番号をクリックすると、onPageChangeが正しく呼び出されること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    
    // ページ番号ボタンをクリック
    fireEvent.click(screen.getByText('2'));
    
    // コールバックが正しいページ番号で呼び出されたことを確認
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('前のページボタンをクリックすると、onPageChangeが現在のページ-1で呼び出されること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    
    // 前のページボタンをクリック
    const prevButton = screen.getByLabelText('前のページ');
    fireEvent.click(prevButton);
    
    // コールバックが現在のページ-1で呼び出されたことを確認
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('次のページボタンをクリックすると、onPageChangeが現在のページ+1で呼び出されること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    
    // 次のページボタンをクリック
    const nextButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextButton);
    
    // コールバックが現在のページ+1で呼び出されたことを確認
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('ページ数が多い場合、省略記号が表示されること', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />
    );
    
    // 省略記号が表示されていることを確認
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
    
    // 最初と最後のページが常に表示されていることを確認
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
}); 