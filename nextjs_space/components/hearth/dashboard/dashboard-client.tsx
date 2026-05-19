'use client'

import { useEffect, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiJson } from '@/lib/api'
import { PageTitle } from '@/components/hearth/page-title'
import { CheckCircle2, Flame, CalendarDays, BookOpen, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { CountUp } from '@/components/hearth/count-up'
import dynamic from 'next/dynamic'

const HabitsChart = dynamic(() => import('./habits-chart').then((m) => m.HabitsChart), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">Drawing your rhythm…</div>,
})
const MoodChart = dynamic(() => import('./mood-chart').then((m) => m.MoodChart), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">Tuning in…</div>,
})

type Stats = {
  tasksCompletedThisWeek: number
  upcomingEvents: number
  journalCountThisMonth: number
  longestStreak: number
  bestHabitName: string
}

export function DashboardClient() {
  const { user, loading } = useDemoUser()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (loading) return
    let active = true
    ;(async () => {
      const data = await apiJson<Stats>('/api/dashboard')
      if (active) setStats(data)
    })()
    return () => { active = false }
  }, [loading, user?.id])

  const cards = [
    {
      label: 'Tasks completed this week',
      value: stats?.tasksCompletedThisWeek ?? 0,
      Icon: CheckCircle2,
      tone: 'from-[hsl(var(--secondary))]/20 to-[hsl(var(--secondary))]/5',
      iconBg: 'bg-[hsl(var(--secondary))]/20 text-[hsl(99,30%,30%)]',
    },
    {
      label: 'Longest current streak',
      value: stats?.longestStreak ?? 0,
      hint: stats?.bestHabitName ? `— ${stats.bestHabitName}` : '',
      Icon: Flame,
      tone: 'from-[hsl(var(--primary))]/20 to-[hsl(var(--primary))]/5',
      iconBg: 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]',
    },
    {
      label: 'Upcoming events (next 7 days)',
      value: stats?.upcomingEvents ?? 0,
      Icon: CalendarDays,
      tone: 'from-[hsl(var(--accent))]/20 to-[hsl(var(--accent))]/5',
      iconBg: 'bg-[hsl(var(--accent))]/20 text-[hsl(28,40%,30%)]',
    },
    {
      label: 'Journal entries this month',
      value: stats?.journalCountThisMonth ?? 0,
      Icon: BookOpen,
      tone: 'from-[hsl(220,60%,70%)]/20 to-[hsl(220,60%,70%)]/5',
      iconBg: 'bg-[hsl(220,60%,70%)]/20 text-[hsl(220,40%,40%)]',
    },
  ] as const

  return (
    <>
      <PageTitle
        greeting="A little look at your journey"
        title="Dashboard"
        subtitle={
          <span>
            <Sparkles className="inline w-4 h-4 mr-1 text-[hsl(var(--accent))]" />
            You're doing wonderfully today — here's what's been blooming.
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.Icon
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-5 paper-texture relative overflow-hidden"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.tone} blur-2xl opacity-80`} />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-4 text-4xl font-semibold text-[hsl(var(--foreground))]">
                  <CountUp to={c.value} />
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{c.label}</div>
                {('hint' in c && c.hint) && (
                  <div className="text-[11px] text-[hsl(var(--muted-foreground))]/80 mt-0.5 italic">{c.hint}</div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h3 className="font-handwritten text-3xl mb-1">Habits over the last 14 days</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">A gentle, honest reflection of your rhythm.</p>
          <div className="h-64">
            <HabitsChart />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-5 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h3 className="font-handwritten text-3xl mb-1">How you've been feeling</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Your moods, gathered with care.</p>
          <div className="h-64">
            <MoodChart />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <div className="inline-block px-6 py-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 border border-[hsl(var(--primary))]/15">
          <div className="font-handwritten text-3xl text-[hsl(var(--foreground))]/85">Look at you go.</div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Every small thing counts. Keep that momentum going.</p>
        </div>
      </motion.div>
    </>
  )
}
