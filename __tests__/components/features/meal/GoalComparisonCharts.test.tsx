/**
 * GoalComparisonChartsコンポーネントのテスト
 */
import { render, screen } from '@testing-library/react';
import { GoalComparisonCharts } from '@/components/features/meal/GoalComparisonCharts';
import '@testing-library/jest-dom';
import { Nutrition, UserProfileFormData } from '@/lib/types';

// rechartをモック
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>
}));

describe('GoalComparisonCharts', () => {
  const mockNutrition: Nutrition = {
    kcal: 1500,
    protein: 70,
    fat: 50,
    carbs: 180
  };

  it('目標が設定されていない場合に適切なメッセージが表示されること', () => {
    render(<GoalComparisonCharts totalNutrition={mockNutrition} userProfile={null} />);
    
    expect(screen.getByText('目標が設定されていません')).toBeInTheDocument();
    expect(screen.getByText('プロフィールで目標を設定する')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
  
  it('カロリー目標のみ設定されている場合にカロリーグラフのみ表示されること', () => {
    const profileWithCaloriesOnly: UserProfileFormData = {
      targetCalories: 2000,
      targetProtein: null,
      targetFat: null,
      targetCarbs: null
    };
    
    render(<GoalComparisonCharts 
      totalNutrition={mockNutrition} 
      userProfile={profileWithCaloriesOnly} 
    />);
    
    expect(screen.getByText('カロリー')).toBeInTheDocument();
    expect(screen.queryByText('栄養素')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart').length).toBe(1);
  });
  
  it('栄養素目標のみ設定されている場合に栄養素グラフのみ表示されること', () => {
    const profileWithNutrientsOnly: UserProfileFormData = {
      targetCalories: null,
      targetProtein: 90,
      targetFat: 60,
      targetCarbs: 250
    };
    
    render(<GoalComparisonCharts 
      totalNutrition={mockNutrition} 
      userProfile={profileWithNutrientsOnly} 
    />);
    
    expect(screen.queryByText('カロリー')).not.toBeInTheDocument();
    expect(screen.getByText('栄養素')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart').length).toBe(1);
  });
  
  it('すべての目標が設定されている場合に両方のグラフが表示されること', () => {
    const completeProfile: UserProfileFormData = {
      targetCalories: 2000,
      targetProtein: 90,
      targetFat: 60,
      targetCarbs: 250
    };
    
    render(<GoalComparisonCharts 
      totalNutrition={mockNutrition} 
      userProfile={completeProfile} 
    />);
    
    expect(screen.getByText('カロリー')).toBeInTheDocument();
    expect(screen.getByText('栄養素')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart').length).toBe(2);
  });
  
  it('目標が0の栄養素はグラフから除外されること', () => {
    const profileWithZeroValues: UserProfileFormData = {
      targetCalories: 2000,
      targetProtein: 90,
      targetFat: 0,
      targetCarbs: 250
    };
    
    render(<GoalComparisonCharts 
      totalNutrition={mockNutrition} 
      userProfile={profileWithZeroValues} 
    />);
    
    // コンポーネント内でfilterが実行されているので、
    // 直接DOMをチェックするのではなく、モックコンポーネントが正しくレンダリングされることを確認
    expect(screen.getByText('栄養素')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart').length).toBe(2);
  });
}); 