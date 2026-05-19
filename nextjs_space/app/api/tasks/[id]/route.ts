import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = getOwnerId(req)
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const existing = await prisma.task.findUnique({ where: { id } })
    if (!existing || existing.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({})) as Record<string, any>
    const data: Record<string, any> = {}
    if (typeof body?.title === 'string') data.title = body.title.slice(0, 200)
    if (typeof body?.description === 'string' || body?.description === null) data.description = body.description
    if (typeof body?.project === 'string') data.project = body.project.slice(0, 80)
    if (['low','medium','high'].includes(body?.priority)) data.priority = body.priority
    if (typeof body?.completed === 'boolean') data.completed = body.completed
    if (body?.dueDate === null) data.dueDate = null
    else if (typeof body?.dueDate === 'string') data.dueDate = new Date(body.dueDate)

    const task = await prisma.task.update({ where: { id }, data })
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ownerId = getOwnerId(req)
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const existing = await prisma.task.findUnique({ where: { id } })
    if (!existing || existing.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
