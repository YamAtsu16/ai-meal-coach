import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import { ObjectId } from 'mongodb';

// 食事記録の取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // パラメータのバリデーション
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid meal ID for GET:', params.id);
      return NextResponse.json(
        { error: '無効な食事記録IDです' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const userId = token.id;
    const { db } = await connectToDatabase();
    
    // IDが有効なObjectIdかチェック
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format for GET:', params.id, error);
      return NextResponse.json(
        { error: '無効な食事記録IDです' },
        { status: 400 }
      );
    }
    
    const meal = await db.collection('meals').findOne({
      _id: objectId,
      userId: userId
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // パラメータのバリデーション
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid meal ID for PUT:', params.id);
      return NextResponse.json(
        { error: '無効な食事記録IDです' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const userId = token.id;
    const body = await request.json();
    const { mealType, date, items, photoUrl } = body;

    const { db } = await connectToDatabase();
    
    // IDが有効なObjectIdかチェック
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format for PUT:', params.id, error);
      return NextResponse.json(
        { error: '無効な食事記録IDです' },
        { status: 400 }
      );
    }
    
    // ユーザーIDが一致する食事記録のみ更新
    const result = await db.collection('meals').findOneAndUpdate(
      { 
        _id: objectId,
        userId: userId
      },
      {
        $set: {
          mealType,
          date: new Date(date),
          photoUrl,
          items,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: '食事記録が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // パラメータのバリデーション
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid meal ID:', params.id);
      return NextResponse.json(
        { error: '無効な食事記録IDです' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const userId = token.id;
    const { db } = await connectToDatabase();

    // IDが有効なObjectIdかチェック
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format:', params.id, error);
      return NextResponse.json(
        { error: '無効な食事記録IDです' },
        { status: 400 }
      );
    }

    // ユーザーIDが一致する食事記録のみ削除
    const result = await db.collection('meals').deleteOne({
      _id: objectId,
      userId: userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '食事記録が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '食事記録を削除しました' });
  } catch (error) {
    console.error('Error deleting meal record:', error);
    return NextResponse.json(
      { error: '食事記録の削除に失敗しました' },
      { status: 500 }
    );
  }
} 