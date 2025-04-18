'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MealRecordForm } from '@/components/features/meal/MealRecordForm';

/**
 * 新規食事記録ページ
 */
export default function NewMealRecordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">食事を記録</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <MealRecordForm
              onSuccess={() => {
                router.push('/home');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 