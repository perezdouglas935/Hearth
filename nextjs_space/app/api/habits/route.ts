import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)

    // last 30 days window
    const since = new Date()
    since.setHours(0, 0, 0, 0)
    since.setDate(since.getDate() - 29)

    const habits = await prisma.habit.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
      include: {
        logs: {
          where: { date: { gte: since } },
          orderBy: { date: 'asc' },
        },
      },
    })
    return NextResponse.json(habits)
  } catch {
    return NextResponse.json({ error: 'Failed to load habits' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const body = await req.json().catch(() => ({})) as {
      name?: string; icon?: string; color?: string;
    }
    if (!body?.name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const habit = await prisma.habit.create({
      data: {
        name: body.name.trim().slice(0, 80),
        icon: body?.icon ?? 'sparkles',
        color: body?.color ?? '#C67B5C',
        ownerId,
      },
    })
    return NextResponse.json(habit)
  } catch {
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
