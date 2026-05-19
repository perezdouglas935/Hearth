import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { displayName?: string; avatar?: string }
    const displayName = (body?.displayName ?? '').trim().slice(0, 40)
    const avatar = (body?.avatar ?? '🦊').slice(0, 6)
    if (!displayName) return NextResponse.json({ error: 'Display name is required' }, { status: 400 })

    const user = await prisma.demoUser.create({ data: { displayName, avatar } })
    return NextResponse.json({ id: user.id, displayName: user.displayName, avatar: user.avatar })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create demo user' }, { status: 500 })
  }
}
