'use client';

import { ToastType, Toast } from "@/components/common/ui/Toast";
import { ReactNode, useContext, useState } from "react";
import { createContext } from 'react';

/**
 * トーストコンテキストのプロパティ
 */
interface ToastContextProps {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

/**
 * トーストコンテキスト
 */
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

/**
 * トーストプロバイダーのプロパティ
 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * トーストプロバイダー
 * @param children 子要素
 * @returns トーストプロバイダー
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType; duration?: number }>>([]);
  const [nextId, setNextId] = useState(0);

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    const id = nextId;
    setNextId(prevId => prevId + 1);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const handleClose = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => handleClose(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * トーストを使用するためのカスタムフック
 * @returns トーストコンテキスト
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 