import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const entries = await prisma.journalEntry.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(entries)
  } catch {
    return NextResponse.json({ error: 'Failed to load journal' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const body = await req.json().catch(() => ({})) as {
      title?: string; content?: string; mood?: string;
    }
    if (!body?.title || !body?.content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    const moods = ['happy','calm','neutral','sad','frustrated']
    const entry = await prisma.journalEntry.create({
      data: {
        title: body.title.trim().slice(0, 200),
        content: body.content.slice(0, 5000),
        mood: moods.includes(body?.mood ?? '') ? body.mood! : 'neutral',
        ownerId,
      },
    })
    return NextResponse.json(entry)
  } catch {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}
