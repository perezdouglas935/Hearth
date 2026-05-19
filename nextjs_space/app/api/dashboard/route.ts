import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOwnerId } from '@/lib/owner'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ownerId = getOwnerId(req)

    const startOfWeek = new Date()
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(startOfWeek.getDate() - 6)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const now = new Date()
    const sevenDaysOut = new Date(now)
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7)

    const tasksCompletedThisWeek = await prisma.task.count({
      where: { ownerId, completed: true, updatedAt: { gte: startOfWeek } },
    })

    const upcomingEvents = await prisma.event.count({
      where: { ownerId, startTime: { gte: now, lte: sevenDaysOut } },
    })

    const journalCountThisMonth = await prisma.journalEntry.count({
      where: { ownerId, createdAt: { gte: startOfMonth } },
    })

    // longest streak across habits
    const habits = await prisma.habit.findMany({
      where: { ownerId },
      include: { logs: { orderBy: { date: 'desc' } } },
    })

    let longestStreak = 0
    let bestHabitName = ''
    for (const h of habits) {
      let streak = 0
      const today = new Date(); today.setHours(0,0,0,0)
      const logSet = new Set((h.logs ?? []).map((l: any) => new Date(l.date).getTime()))
      // walk back day by day
      const walker = new Date(today)
      while (logSet.has(walker.getTime())) {
        streak++
        walker.setDate(walker.getDate() - 1)
      }
      if (streak > longestStreak) {
        longestStreak = streak
        bestHabitName = h.name
      }
    }

    return NextResponse.json({
      tasksCompletedThisWeek,
      upcomingEvents,
      journalCountThisMonth,
      longestStreak,
      bestHabitName,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
