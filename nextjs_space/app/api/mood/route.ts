import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const since = new Date()
    since.setHours(0,0,0,0)
    since.setDate(since.getDate() - 13)
    const entries = await prisma.moodEntry.findMany({
      where: { ownerId, date: { gte: since } },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(entries)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const body = await req.json().catch(() => ({})) as { mood?: string; date?: string }
    const moods = ['happy','calm','neutral','sad','frustrated']
    if (!moods.includes(body?.mood ?? '')) return NextResponse.json({ error: 'Invalid mood' }, { status: 400 })

    const date = body?.date ? new Date(body.date) : new Date()
    date.setHours(0,0,0,0)

    // Upsert is tricky without a unique key; emulate with findFirst + update/create
    const existing = await prisma.moodEntry.findFirst({ where: { ownerId, date } })
    if (existing) {
      const updated = await prisma.moodEntry.update({ where: { id: existing.id }, data: { mood: body.mood! } })
      return NextResponse.json(updated)
    }
    const entry = await prisma.moodEntry.create({ data: { mood: body.mood!, date, ownerId } })
    return NextResponse.json(entry)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
