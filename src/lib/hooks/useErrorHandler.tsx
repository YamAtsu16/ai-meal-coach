'use client';

import { useState } from 'react';
import { useToast } from '@/providers';

/**
 * エラーハンドリングフック
 * 
 * @returns エラーハンドリング関連の関数と状態
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  /**
   * エラーを処理する関数
   * 
   * @param error - エラーオブジェクトまたはエラーメッセージ
   * @param defaultMessage - デフォルトのエラーメッセージ
   */
  const handleError = (
    error: unknown,
    defaultMessage = '予期せぬエラーが発生しました',
  ) => {
    let errorMessage: string;
    
    // エラーの種類に応じてメッセージを設定
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = defaultMessage;
    }
    
    // エラー状態を更新
    setError(errorMessage);
    
    showToast(errorMessage, 'error');
    
    // コンソールにはエラーを記録
    console.error(errorMessage, error);
    
    return errorMessage;
  };

  /**
   * エラー状態をクリアする関数
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * APIレスポンスからエラーメッセージを抽出する関数
   * 
   * @param response - fetchのレスポンスオブジェクト
   * @returns エラーメッセージ
   */
  const extractErrorFromResponse = async (response: Response): Promise<string> => {
    try {
      const contentType = response.headers.get('content-type');
      
      // JSONレスポンスの場合
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.error || data.message || `エラー: ${response.status}`;
      }
      
      // テキストレスポンスの場合
      const text = await response.text();
      return text || `エラー: ${response.status}`;
    } catch {
      return `エラー: ${response.status}`;
    }
  };

  return {
    error,
    handleError,
    clearError,
    extractErrorFromResponse
  };
}; 