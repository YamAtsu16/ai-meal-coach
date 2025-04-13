/**
 * NutritionBalanceChartコンポーネントのテスト
 */
import { render, screen } from '@testing-library/react';
import { NutritionBalanceChart } from '@/components/features/meal/NutritionBalanceChart';
import '@testing-library/jest-dom';
import { Nutrition } from '@/lib/types';

// rechartをモック
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>
}));

describe('NutritionBalanceChart', () => {
  it('総カロリーが0の場合に「データがありません」メッセージが表示されること', () => {
    const emptyNutrition: Nutrition = {
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    };
    
    render(<NutritionBalanceChart totalNutrition={emptyNutrition} />);
    
    expect(screen.getByText('データがありません')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });
  
  it('総カロリーが0より大きい場合に栄養バランスチャートが表示されること', () => {
    const nutrition: Nutrition = {
      kcal: 500,
      protein: 25,
      fat: 15,
      carbs: 70
    };
    
    render(<NutritionBalanceChart totalNutrition={nutrition} />);
    
    expect(screen.queryByText('データがありません')).not.toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
  
  it('各栄養素の情報が正しく表示されること', () => {
    const nutrition: Nutrition = {
      kcal: 500,
      protein: 25,
      fat: 15,
      carbs: 70
    };
    
    render(<NutritionBalanceChart totalNutrition={nutrition} />);
    
    // タンパク質（25g x 4kcal = 100kcal）
    expect(screen.getByText('タンパク質')).toBeInTheDocument();
    expect(screen.getByText(/25\.0/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    
    // 脂質（15g x 9kcal = 135kcal）
    expect(screen.getByText('脂質')).toBeInTheDocument();
    expect(screen.getByText(/15\.0/)).toBeInTheDocument();
    expect(screen.getByText(/135/)).toBeInTheDocument();
    
    // 炭水化物（70g x 4kcal = 280kcal）
    expect(screen.getByText('炭水化物')).toBeInTheDocument();
    expect(screen.getByText(/70\.0/)).toBeInTheDocument();
    expect(screen.getByText(/280/)).toBeInTheDocument();
  });
  
  it('栄養素比率が正しく計算されること', () => {
    const nutrition: Nutrition = {
      kcal: 1000,
      protein: 50,
      fat: 40,
      carbs: 100
    };
    
    // protein: 50g x 4 = 200kcal (20%)
    // fat: 40g x 9 = 360kcal (36%)
    // carbs: 100g x 4 = 400kcal (40%)
    
    render(<NutritionBalanceChart totalNutrition={nutrition} />);
    
    const nutritionData = [
      { name: 'タンパク質', value: 200, grams: 50, color: '#3B82F6' },
      { name: '脂質', value: 360, grams: 40, color: '#EF4444' },
      { name: '炭水化物', value: 400, grams: 100, color: '#10B981' }
    ];
    
    nutritionData.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${item.grams.toFixed(1)}`))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${Math.round(item.value)}`))).toBeInTheDocument();
    });
  });
}); 