import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = getOwnerId(req)
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({})) as { date?: string }
    const date = body?.date ? new Date(body.date) : new Date()
    date.setHours(0, 0, 0, 0)

    // Toggle: if completed log exists, remove it; otherwise create.
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date } },
    })

    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } })
      return NextResponse.json({ completed: false, date: date.toISOString() })
    } else {
      await prisma.habitLog.create({
        data: { habitId: id, date, completed: true, ownerId },
      })
      return NextResponse.json({ completed: true, date: date.toISOString() })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 })
  }
}
