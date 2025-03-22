import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface FoodItemInput {
  name: string;
  quantity: number;
  unit: string;
  caloriesPerHundredGrams: number;
  proteinPerHundredGrams: number;
  fatPerHundredGrams: number;
  carbsPerHundredGrams: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

interface MealRecordInput {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  items: FoodItemInput[];
  photoUrl: string | null;
}

// 食事記録の取得
export async function GET() {
  try {
    const meals = await prisma.mealRecord.findMany({
      include: {
        items: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(meals);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return NextResponse.json({ error: '食事記録の取得に失敗しました' }, { status: 500 });
  }
}

// 食事記録の作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mealType, date, items, photoUrl } = body as MealRecordInput;

    const meal = await prisma.mealRecord.create({
      data: {
        mealType,
        date: new Date(date),
        photoUrl,
        items: {
          create: items.map((item: FoodItemInput) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            caloriesPerHundredGrams: item.caloriesPerHundredGrams,
            proteinPerHundredGrams: item.proteinPerHundredGrams,
            fatPerHundredGrams: item.fatPerHundredGrams,
            carbsPerHundredGrams: item.carbsPerHundredGrams,
            totalCalories: item.totalCalories,
            totalProtein: item.totalProtein,
            totalFat: item.totalFat,
            totalCarbs: item.totalCarbs,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    let errorMessage = '保存に失敗しました';
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        errorMessage = 'データが重複しています';
      } else if (error.code === 'P2000') {
        errorMessage = '入力データが不正です';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, mealType, date, items, photoUrl } = data;

    // 既存の食事記録を更新
    const updatedMeal = await prisma.mealRecord.update({
      where: { id },
      data: {
        mealType,
        date: new Date(date),
        photoUrl,
        items: {
          // 既存のアイテムを削除
          deleteMany: {},
          // 新しいアイテムを作成
          create: items.map((item: FoodItemInput) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            caloriesPerHundredGrams: item.caloriesPerHundredGrams,
            proteinPerHundredGrams: item.proteinPerHundredGrams,
            fatPerHundredGrams: item.fatPerHundredGrams,
            carbsPerHundredGrams: item.carbsPerHundredGrams,
            totalCalories: item.totalCalories,
            totalProtein: item.totalProtein,
            totalFat: item.totalFat,
            totalCarbs: item.totalCarbs,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedMeal);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: '更新に失敗しました' },
      { status: 500 }
    );
  }
} 