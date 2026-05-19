'use client'

import { useEffect, useState } from 'react'
import { apiFetch, apiJson } from '@/lib/api'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { useMounted } from '@/hooks/use-mounted'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const MOOD_OPTIONS = [
  { key: 'happy', emoji: '😊', label: 'Joyful' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'sad', emoji: '😔', label: 'Tender' },
  { key: 'frustrated', emoji: '😤', label: 'Tough day' },
]

type MoodEntry = { id: string; mood: string; date: string }

export function MoodCheckin() {
  const { user, loading } = useDemoUser()
  const mounted = useMounted()
  const [todayMood, setTodayMood] = useState<string | null>(null)
  const [history, setHistory] = useState<MoodEntry[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    let active = true
    ;(async () => {
      const data = await apiJson<MoodEntry[]>('/api/mood')
      if (!active) return
      const list = data ?? []
      setHistory(list)
      const today = new Date(); today.setHours(0,0,0,0)
      const todays = list.find((m) => new Date(m.date).getTime() === today.getTime())
      setTodayMood(todays?.mood ?? null)
    })()
    return () => { active = false }
  }, [loading, user?.id])

  const select = async (key: string) => {
    if (saving) return
    if (!user) {
      toast.message('Browsing as guest', { description: 'Create a demo account to save your mood.' })
      return
    }
    setSaving(true)
    setTodayMood(key)
    const res = await apiFetch('/api/mood', { method: 'POST', body: JSON.stringify({ mood: key }) })
    setSaving(false)
    if (res.ok) toast.success('Thanks for checking in \ud83d\udcab')
  }

  const moodEmoji = (k: string) => MOOD_OPTIONS.find((m) => m.key === k)?.emoji ?? '😐'

  // build last 7 days (deferred until after mount to avoid SSR/client mismatch)
  const last7 = mounted
    ? Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i))
        const entry = history.find((m) => new Date(m.date).getTime() === d.getTime())
        return { date: d, mood: entry?.mood ?? null }
      })
    : []

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl p-5 paper-texture h-full"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-handwritten text-3xl text-[hsl(var(--foreground))]">How are you, really?</h3>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">A gentle check-in</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 mt-3">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.key}
            onClick={() => select(m.key)}
            className={cn(
              'group flex-1 sm:flex-initial rounded-2xl px-3 py-3 transition-all duration-200',
              'hover:bg-[hsl(var(--primary))]/10 hover:-translate-y-0.5',
              todayMood === m.key
                ? 'bg-[hsl(var(--primary))]/15 ring-2 ring-[hsl(var(--primary))] shadow-md'
                : 'bg-[hsl(var(--muted))]/60'
            )}
            aria-label={m.label}
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">{m.emoji}</div>
            <div className="text-[10px] sm:text-xs mt-1 text-[hsl(var(--muted-foreground))]">{m.label}</div>
          </button>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-dashed border-[hsl(var(--border))]">
        <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Last 7 days</div>
        <div className="flex items-center gap-1.5">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={cn(
                'h-9 rounded-lg flex items-center justify-center text-lg',
                d.mood ? 'bg-[hsl(var(--primary))]/10' : 'bg-[hsl(var(--muted))]/60 opacity-60'
              )}>
                {d.mood ? moodEmoji(d.mood) : '·'}
              </div>
              <div className="text-[10px] mt-1 text-[hsl(var(--muted-foreground))]">
                {d.date.toLocaleDateString('en-US', { weekday: 'short' })[0]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
