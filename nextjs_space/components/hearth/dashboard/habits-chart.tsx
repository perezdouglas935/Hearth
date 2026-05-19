'use client'

import { useEffect, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiJson } from '@/lib/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

type HabitLog = { id: string; date: string; completed: boolean }
type Habit = { id: string; name: string; logs: HabitLog[] }

export function HabitsChart() {
  const { user, loading } = useDemoUser()
  const [habits, setHabits] = useState<Habit[]>([])

  useEffect(() => {
    if (loading) return
    let active = true
    ;(async () => {
      const data = await apiJson<Habit[]>('/api/habits')
      if (active) setHabits(data ?? [])
    })()
    return () => { active = false }
  }, [loading, user?.id])

  // Build last 14 days completion count across all habits
  const days: { day: string; completed: number; possible: number }[] = []
  const now = new Date(); now.setHours(0, 0, 0, 0)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    let completed = 0
    for (const h of habits) {
      if ((h.logs ?? []).some((l) => new Date(l.date).getTime() === d.getTime())) completed++
    }
    days.push({
      day: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      completed,
      possible: habits.length,
    })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={days} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
        <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 10 }} />
        <Tooltip wrapperStyle={{ fontSize: 11 }} cursor={{ fill: 'hsl(36 100% 97% / 0.6)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" />
        <Bar dataKey="completed" name="Completed" fill="#C67B5C" radius={[6, 6, 0, 0]} />
        <Bar dataKey="possible" name="All habits" fill="#8FAE7E" fillOpacity={0.35} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
