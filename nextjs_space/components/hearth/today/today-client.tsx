'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiJson, apiFetch } from '@/lib/api'
import { getGreeting, pickQuoteFromDate } from '@/lib/encouragement'
import { useMounted } from '@/hooks/use-mounted'
import { PageTitle } from '@/components/hearth/page-title'
import { WeatherWidget } from './weather-widget'
import { MoodCheckin } from './mood-checkin'
import { TodayAgenda } from './today-agenda'
import { motion } from 'framer-motion'
import { Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoSignInModal } from '@/components/hearth/demo-signin-modal'

type Task = { id: string; title: string; completed: boolean; project: string; priority: string; dueDate: string | null }
type EventT = { id: string; title: string; startTime: string; endTime: string | null; category: string; location: string | null }

export function TodayClient() {
  const { user, loading } = useDemoUser()
  const mounted = useMounted()
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<EventT[]>([])
  const [openSignIn, setOpenSignIn] = useState(false)
  const greeting = mounted ? getGreeting() : 'Hello'
  const quote = useMemo(() => mounted ? pickQuoteFromDate() : '', [mounted])

  useEffect(() => {
    if (loading) return
    let active = true
    ;(async () => {
      const [t, e] = await Promise.all([
        apiJson<Task[]>('/api/tasks'),
        apiJson<EventT[]>('/api/events'),
      ])
      if (!active) return
      setTasks(t ?? [])
      setEvents(e ?? [])
    })()
    return () => { active = false }
  }, [loading, user?.id])

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)))
    await apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) })
  }

  const dateLabel = mounted
    ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : 'Today'

  return (
    <>
      <PageTitle
        greeting={`${greeting}, ${user?.displayName ?? 'friend'}!`}
        title={dateLabel}
        subtitle={user ? "Here's a gentle look at your day. Take a breath \u2014 you've got this." : "You're peeking into a sample Hearth. Create a demo account to make it your own."}
        right={
          !user && (
            <Button onClick={() => setOpenSignIn(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white shadow-md">
              <UserPlus size={16} className="mr-2" /> Create your demo account
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <WeatherWidget />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="lg:col-span-2">
          <MoodCheckin />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-5">
        <TodayAgenda tasks={tasks} events={events} onToggleTask={toggleTask} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="mt-8 mb-2 text-center"
      >
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))]/10 via-[hsl(var(--accent))]/10 to-[hsl(var(--secondary))]/10 border border-[hsl(var(--primary))]/15">
          <Sparkles size={16} className="text-[hsl(var(--accent))]" />
          <span className="font-handwritten text-2xl text-[hsl(var(--foreground))]/85">{quote}</span>
        </div>
      </motion.div>

      <DemoSignInModal open={openSignIn} onOpenChange={setOpenSignIn} />
    </>
  )
}
