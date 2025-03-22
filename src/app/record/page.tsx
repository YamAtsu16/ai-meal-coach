import { MealRecordForm } from '../components/MealRecordForm';

export default function RecordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            食事を記録
          </h1> 
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <MealRecordForm />
          </div>
        </div>
      </main>
    </div>
  );
} 