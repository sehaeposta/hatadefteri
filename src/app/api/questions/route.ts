import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');

    const where = branch && branch !== 'ALL' 
      ? { branch: branch as any } 
      : {};

    const questions = await db.question.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Sorular yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branch, imageUrl, note } = body;

    if (!branch || !imageUrl) {
      return NextResponse.json(
        { error: 'Branş ve görsel zorunludur' },
        { status: 400 }
      );
    }

    const question = await db.question.create({
      data: {
        branch,
        imageUrl,
        note: note || null
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Soru oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
