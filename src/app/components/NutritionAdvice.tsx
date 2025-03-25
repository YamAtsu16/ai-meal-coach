'use client';

import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface NutritionAdviceProps {
  selectedDate: string;
}

export default function NutritionAdvice({ selectedDate }: NutritionAdviceProps) {
  const [analysisType, setAnalysisType] = useState<'daily' | 'weekly'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAPIKeyWarning, setShowAPIKeyWarning] = useState(false);

  // 分析タイプが変更された時にリセット
  useEffect(() => {
    setAnalysisResult(null);
    setError(null);
  }, [analysisType]);

  // 選択された日付が変更された時にリセット
  useEffect(() => {
    if (analysisType === 'daily') {
      setAnalysisResult(null);
      setError(null);
    }
  }, [selectedDate, analysisType]);

  const handleStartAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);

      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          analysisType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // APIキーがない場合の特別なエラーメッセージ
        if (data.message === 'OpenAI APIキーが設定されていません') {
          setShowAPIKeyWarning(true);
          setError('OpenAI APIキーが設定されていません。APIキーの設定方法は管理者にお問い合わせください。');
        } else {
          setError(data.message || '分析処理中にエラーが発生しました');
        }
        return;
      }

      if (data.success && data.data) {
        setAnalysisResult(data.data.result);
      } else {
        setError('分析結果を取得できませんでした');
      }
    } catch (error) {
      setError('通信エラーが発生しました。ネットワーク接続を確認してください。');
      console.error('分析リクエストエラー:', error);
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

      {/* 分析タイプ選択 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <LightBulbIcon className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-medium text-gray-800">分析タイプを選択</h3>
        </div>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-md ${
              analysisType === 'daily'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setAnalysisType('daily')}
          >
            日次分析
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              analysisType === 'weekly'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setAnalysisType('weekly')}
          >
            週間分析
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {analysisType === 'daily'
            ? '選択した日付の食事を詳細に分析します'
            : '過去7日間の食事パターンを分析します'}
        </p>
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

      {/* API警告メッセージ */}
      {showAPIKeyWarning && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <h4 className="font-medium mb-2">OpenAI APIキーが必要です</h4>
          <p className="text-sm">
            この機能を使用するには、OpenAI APIキーの設定が必要です。
            <br />
            .envファイルにAPIキーを設定してください：
            <code className="block bg-gray-800 text-white p-2 rounded mt-2 text-xs">
              OPENAI_API_KEY=your_api_key_here
            </code>
          </p>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && !showAPIKeyWarning && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* 分析結果表示 */}
      {analysisResult && (
        <div className="mb-2">
          <h3 className="text-lg font-medium text-gray-800 mb-3">分析結果</h3>
          <div className="p-5 bg-blue-50 rounded-lg border border-blue-100 whitespace-pre-line">
            {analysisResult}
          </div>
        </div>
      )}

      {/* 注意書き */}
      <div className="text-xs text-gray-500 mt-6">
        <p>※ AI分析は参考情報です。正確な栄養アドバイスについては専門家にご相談ください。</p>
        <p>※ 分析には最大30秒程度かかる場合があります。</p>
      </div>
    </div>
  );
} 