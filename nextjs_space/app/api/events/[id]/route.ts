import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = getOwnerId(req)
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing || existing.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
