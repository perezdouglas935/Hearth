'use client'

import { useEffect, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiJson } from '@/lib/api'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

type MoodEntry = { id: string; date: string; mood: string }

const MOOD_TO_VALUE: Record<string, number> = { happy: 5, calm: 4, neutral: 3, sad: 2, frustrated: 1 }
const VALUE_TO_LABEL: Record<number, string> = { 1: 'Tough', 2: 'Tender', 3: 'Neutral', 4: 'Calm', 5: 'Joyful' }

export function MoodChart() {
  const { user, loading } = useDemoUser()
  const [entries, setEntries] = useState<MoodEntry[]>([])

  useEffect(() => {
    if (loading) return
    let active = true
    ;(async () => {
      const data = await apiJson<MoodEntry[]>('/api/mood')
      if (active) setEntries(data ?? [])
    })()
    return () => { active = false }
  }, [loading, user?.id])

  const days: { day: string; value: number | null; label?: string }[] = []
  const now = new Date(); now.setHours(0, 0, 0, 0)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const e = entries.find((m) => new Date(m.date).getTime() === d.getTime())
    days.push({
      day: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      value: e ? (MOOD_TO_VALUE[e.mood] ?? 3) : null,
      label: e ? VALUE_TO_LABEL[MOOD_TO_VALUE[e.mood] ?? 3] : undefined,
    })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={days} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
        <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis
          domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(v: number) => VALUE_TO_LABEL[v] ?? ''}
          width={70}
        />
        <Tooltip wrapperStyle={{ fontSize: 11 }} cursor={{ stroke: 'hsl(36 100% 80% / 0.6)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" />
        <Line type="monotone" dataKey="value" name="Mood" stroke="#C67B5C" strokeWidth={2.5}
          dot={{ r: 4, fill: '#D4A843', strokeWidth: 0 }} connectNulls={false} animationDuration={900} />
      </LineChart>
    </ResponsiveContainer>
  )
}
