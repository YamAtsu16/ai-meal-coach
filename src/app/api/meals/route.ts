import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface FoodItemInput {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
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
  } catch (error: unknown) {
    console.error('Error fetching meal records:', error);
    return NextResponse.json({ error: '食事記録の取得に失敗しました' }, { status: 500 });
  }
}

// 食事記録の作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mealType, date, items, photoUrl } = body;

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
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbohydrate: item.carbohydrate,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(meal);
  } catch (error: unknown) {
    console.error('Error creating meal record:', error);
    return NextResponse.json({ error: '食事記録の作成に失敗しました' }, { status: 500 });
  }
} 