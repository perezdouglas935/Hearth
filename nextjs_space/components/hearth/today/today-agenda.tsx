'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { motion } from 'framer-motion'
import { ListTodo, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Task = { id: string; title: string; completed: boolean; project: string; priority: string; dueDate: string | null }
type EventT = { id: string; title: string; startTime: string; endTime: string | null; category: string; location: string | null }

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const CATEGORY_COLORS: Record<string, string> = {
  work: 'bg-[hsl(220,60%,70%)]/15 text-[hsl(220,60%,40%)]',
  personal: 'bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]',
  health: 'bg-[hsl(var(--secondary))]/20 text-[hsl(var(--secondary-foreground))]',
  social: 'bg-[hsl(var(--accent))]/20 text-[hsl(28,40%,30%)]',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-[hsl(var(--secondary))]/20 text-[hsl(99,30%,30%)]',
  medium: 'bg-[hsl(var(--accent))]/20 text-[hsl(28,40%,30%)]',
  high: 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]',
}

export function TodayAgenda({
  tasks, events, onToggleTask,
}: { tasks: Task[]; events: EventT[]; onToggleTask: (id: string, completed: boolean) => void }) {
  const today = new Date()
  const todaysTasks = tasks.filter((t) => t.dueDate && sameDay(new Date(t.dueDate), today))
  const todaysEvents = events.filter((e) => sameDay(new Date(e.startTime), today))
  const empty = todaysTasks.length === 0 && todaysEvents.length === 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Today's tasks */}
      <motion.div whileHover={{ y: -2 }} className="rounded-2xl p-5 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-handwritten text-3xl flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-[hsl(var(--primary))]" /> Today's tasks
          </h3>
          <Link href="/tasks" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
            See all →
          </Link>
        </div>
        {todaysTasks.length === 0 ? (
          <div className="text-sm text-[hsl(var(--muted-foreground))] py-4 italic">
            Nothing on the docket today. Maybe a quiet moment is calling.
          </div>
        ) : (
          <ul className="space-y-2">
            {todaysTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--muted))]/60 transition"
              >
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(v) => onToggleTask(t.id, !!v)}
                  className="mt-0.5 data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))]"
                />
                <div className="flex-1 min-w-0">
                  <div className={cn('text-sm', t.completed && 'line-through text-[hsl(var(--muted-foreground))]')}>
                    {t.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{t.project}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', PRIORITY_COLORS[t.priority] ?? '')}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Today's events */}
      <motion.div whileHover={{ y: -2 }} className="rounded-2xl p-5 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-handwritten text-3xl flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[hsl(var(--primary))]" /> Today's plans
          </h3>
          <Link href="/calendar" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
            Calendar →
          </Link>
        </div>
        {todaysEvents.length === 0 ? (
          <div className="text-sm text-[hsl(var(--muted-foreground))] py-4 italic">
            A clear day. Lovely.
          </div>
        ) : (
          <ul className="space-y-2">
            {todaysEvents.map((e) => (
              <li key={e.id} className="p-2.5 rounded-xl hover:bg-[hsl(var(--muted))]/60 transition">
                <div className="flex items-start gap-2">
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full mt-1', CATEGORY_COLORS[e.category] ?? '')}>
                    {e.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1"><Clock size={11} />
                        {new Date(e.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {e.location && <span className="flex items-center gap-1 truncate"><MapPin size={11} /> {e.location}</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {empty && (
        <div className="md:col-span-2 text-center py-2">
          <Button asChild variant="ghost" className="rounded-xl text-[hsl(var(--primary))]">
            <Link href="/tasks">Add something cozy to your day →</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
