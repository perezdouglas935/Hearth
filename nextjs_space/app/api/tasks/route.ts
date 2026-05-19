import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const tasks = await prisma.task.findMany({
      where: { ownerId },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(tasks)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)
    const body = await req.json().catch(() => ({})) as {
      title?: string; description?: string | null; project?: string;
      priority?: string; dueDate?: string | null; completed?: boolean;
    }
    if (!body?.title || !body?.project) {
      return NextResponse.json({ error: 'Title and project required' }, { status: 400 })
    }
    const task = await prisma.task.create({
      data: {
        title: body.title.trim().slice(0, 200),
        description: body.description ?? null,
        project: body.project.trim().slice(0, 80),
        priority: ['low','medium','high'].includes(body?.priority ?? '') ? body.priority! : 'medium',
        dueDate: body?.dueDate ? new Date(body.dueDate) : null,
        completed: !!body?.completed,
        ownerId,
      },
    })
    return NextResponse.json(task)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
