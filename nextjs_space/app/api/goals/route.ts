import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const goals = await prisma.goal.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(goals)
  } catch {
    return NextResponse.json({ error: 'Failed to load goals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const body = await req.json().catch(() => ({})) as {
      title?: string; description?: string | null; category?: string;
      progress?: number; targetDate?: string | null;
    }
    if (!body?.title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const progress = Math.max(0, Math.min(100, Number(body?.progress ?? 0)))
    const goal = await prisma.goal.create({
      data: {
        title: body.title.trim().slice(0, 200),
        description: body?.description ?? null,
        category: ['health','career','personal','financial'].includes(body?.category ?? '') ? body.category! : 'personal',
        progress,
        targetDate: body?.targetDate ? new Date(body.targetDate) : null,
        ownerId,
      },
    })
    return NextResponse.json(goal)
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
