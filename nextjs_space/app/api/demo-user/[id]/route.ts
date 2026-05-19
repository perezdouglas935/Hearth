import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json().catch(() => ({})) as { displayName?: string; avatar?: string }
    const data: { displayName?: string; avatar?: string } = {}
    if (typeof body?.displayName === 'string' && body.displayName.trim().length > 0) data.displayName = body.displayName.trim().slice(0, 40)
    if (typeof body?.avatar === 'string' && body.avatar.trim().length > 0) data.avatar = body.avatar.trim().slice(0, 6)

    const user = await prisma.demoUser.update({ where: { id }, data })
    return NextResponse.json({ id: user.id, displayName: user.displayName, avatar: user.avatar })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
