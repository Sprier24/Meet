import { db } from '@/db';
import { certificates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, parseInt(params.id)),
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching certificate' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    await db.update(certificates)
      .set(body)
      .where(eq(certificates.id, parseInt(params.id)));

    return NextResponse.json({ message: 'Certificate updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating certificate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(certificates).where(eq(certificates.id, parseInt(params.id)));
    return NextResponse.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting certificate' },
      { status: 500 }
    );
  }
}
