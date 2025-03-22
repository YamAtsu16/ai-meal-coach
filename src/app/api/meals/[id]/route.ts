import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface FoodItemInput {
  name: string;
  quantity: number;
  unit: string;
}

// 食事記録の取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meal = await prisma.mealRecord.findUnique({
      where: {
        id: params.id,
      },
      include: {
        items: true,
      },
    });

    if (!meal) {
      return NextResponse.json(
        { error: '食事記録が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error('Error fetching meal record:', error);
    return NextResponse.json(
      { error: '食事記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 食事記録の更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { mealType, date, items, photoUrl } = body;

    // 既存の食品アイテムを削除
    await prisma.foodItem.deleteMany({
      where: {
        mealRecordId: params.id,
      },
    });

    // 食事記録を更新
    const updatedMeal = await prisma.mealRecord.update({
      where: {
        id: params.id,
      },
      data: {
        mealType,
        date: new Date(date),
        photoUrl,
        items: {
          create: items.map((item: FoodItemInput) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedMeal);
  } catch (error) {
    console.error('Error updating meal record:', error);
    return NextResponse.json(
      { error: '食事記録の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 食事記録の削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.mealRecord.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: '食事記録を削除しました' });
  } catch (error) {
    console.error('Error deleting meal record:', error);
    return NextResponse.json(
      { error: '食事記録の削除に失敗しました' },
      { status: 500 }
    );
  }
} 