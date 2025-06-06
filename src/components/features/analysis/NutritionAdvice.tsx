'use client';

import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useErrorHandler } from '@/lib/hooks';

/**
 * 栄養アドバイスコンポーネントのProps
 */
interface NutritionAdviceProps {
  selectedDate: string;
}

/**
 * 栄養アドバイスコンポーネント
 * @param selectedDate 選択された日付
 */
export default function NutritionAdvice({ selectedDate }: NutritionAdviceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAPIKeyWarning, setShowAPIKeyWarning] = useState(false);
  const { handleError } = useErrorHandler();

  /**
   * 選択された日付が変更された時にリセット
   */
  useEffect(() => {
    setAnalysisResult(null);
    setShowAPIKeyWarning(false);
  }, [selectedDate]);

  /**
   * 分析を開始する
   */
  const handleStartAnalysis = async () => {
    try {
      setIsLoading(true);
      setShowAPIKeyWarning(false);
      setAnalysisResult(null);

      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // APIキーがない場合の特別なエラーメッセージ
        if (data.message === 'OpenAI APIキーが設定されていません') {
          setShowAPIKeyWarning(true);
        } else {
          const errorMessage = data.message || '分析処理中にエラーが発生しました';
          handleError(errorMessage, '分析処理中にエラーが発生しました');
        }
        return;
      }

      if (data.success && data.data) {
        setAnalysisResult(data.data.result);
      } else {
        const errorMessage = '分析結果を取得できませんでした';
        handleError(errorMessage);
      }
    } catch (error) {
      const errorMessage = '通信エラーが発生しました。ネットワーク接続を確認してください。';
      handleError(error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <SparklesIcon className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">
          AIによる栄養アドバイス
        </h2>
      </div>

      {/* 分析開始ボタン */}
      <div className="mb-6">
        <button
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          onClick={handleStartAnalysis}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              分析を開始
            </>
          )}
        </button>
      </div>

      {/* API警告メッセージ - APIキー関連の重要な警告なので画面内に表示する */}
      {showAPIKeyWarning && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          <h4 className="font-medium mb-2">予期せぬエラーが発生しました</h4>
          <p className="text-sm">
            お手数ですが、管理者に問い合わせてください。
          </p>
        </div>
      )}

      {/* 分析結果表示 */}
      {analysisResult && (
        <div className="mb-2">
          <h3 className="text-lg font-medium text-gray-800 mb-3">分析結果</h3>
          <div className="nutrition-analysis-content bg-blue-50 rounded-lg border border-blue-100 overflow-auto">
            <div
              dangerouslySetInnerHTML={{ __html: analysisResult }}
              className="nutrition-analysis p-5"
            />
          </div>
        </div>
      )}

      {/* 注意書き */}
      <div className="text-xs text-gray-500 mt-6">
        <p>※ AI分析は参考情報です。正確な栄養アドバイスについては専門家にご相談ください。</p>
        <p>※ 分析には最大30秒程度かかる場合があります。</p>
      </div>

      {/* 分析結果のスタイル */}
      <style jsx global>{`
        .nutrition-analysis h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .nutrition-analysis h3 {
          font-size: 1.25rem;
          font-weight: 500;
          color: #374151;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        
        .nutrition-analysis p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .nutrition-analysis ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .nutrition-analysis li {
          margin-bottom: 0.5rem;
        }
        
        .nutrition-analysis strong {
          font-weight: 600;
          color: #1e40af;
        }
        
        .nutrition-analysis section {
          margin-bottom: 2rem;
        }
        
        .nutrition-analysis .callout {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 1rem 0;
        }
        
        .nutrition-analysis-content {
          max-height: 600px;
        }
      `}</style>
    </div>
  );
} 