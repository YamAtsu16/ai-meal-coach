'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

/**
 * トーストの型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * トーストのプロパティ
 */
interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

/**
 * トーストのスタイル
 */
const TOAST_STYLES = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircleIcon,
    iconColor: 'text-green-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircleIcon,
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-500',
  },
};

/**
 * トースト
 * @param message メッセージ
 * @param type 型
 * @param duration 持続時間
 * @param onClose 閉じる
 */
export function Toast({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { bg, border, text, icon: Icon, iconColor } = TOAST_STYLES[type];

  // トーストが表示されている時間が経過したらトーストを閉じる
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`${bg} ${border} ${text} border rounded-lg shadow-md transition-all duration-300 transform translate-y-0`}
      role="alert"
    >
      <div className="flex p-4">
        <Icon className={`w-5 h-5 ${iconColor} mr-3 flex-shrink-0`} />
        <div className="ml-1 text-sm font-medium">{message}</div>
        <button
          type="button"
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 ${text} hover:bg-gray-200 focus:outline-none`}
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          <span className="sr-only">閉じる</span>
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}