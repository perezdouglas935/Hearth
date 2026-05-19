import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const events = await prisma.event.findMany({
      where: { ownerId },
      orderBy: { startTime: 'asc' },
    })
    return NextResponse.json(events)
  } catch {
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const body = await req.json().catch(() => ({})) as {
      title?: string; description?: string | null; startTime?: string; endTime?: string | null;
      category?: string; location?: string | null;
    }
    if (!body?.title || !body?.startTime) {
      return NextResponse.json({ error: 'Title and start time are required' }, { status: 400 })
    }
    const event = await prisma.event.create({
      data: {
        title: body.title.trim().slice(0, 200),
        description: body?.description ?? null,
        startTime: new Date(body.startTime),
        endTime: body?.endTime ? new Date(body.endTime) : null,
        category: ['work','personal','health','social'].includes(body?.category ?? '') ? body.category! : 'personal',
        location: body?.location ?? null,
        ownerId,
      },
    })
    return NextResponse.json(event)
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
