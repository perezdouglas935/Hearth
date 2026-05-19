'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiFetch, apiJson } from '@/lib/api'
import { useMounted } from '@/hooks/use-mounted'
import { PageTitle } from '@/components/hearth/page-title'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Flame, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type HabitLog = { id: string; date: string; completed: boolean }
type Habit = { id: string; name: string; icon: string; color: string; logs: HabitLog[] }

const COLOR_PRESETS = ['#C67B5C', '#8FAE7E', '#D4A843', '#A19AD3', '#60B5FF', '#FF9898']

function dateAtMidnight(daysAgo: number): Date {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - daysAgo); return d
}

function streakOf(logs: HabitLog[]): number {
  const set = new Set((logs ?? []).map((l) => new Date(l.date).getTime()))
  const today = new Date(); today.setHours(0,0,0,0)
  let count = 0
  const w = new Date(today)
  while (set.has(w.getTime())) {
    count++
    w.setDate(w.getDate() - 1)
  }
  return count
}

export function HabitsClient() {
  const { user, loading } = useDemoUser()
  const mounted = useMounted()
  const [habits, setHabits] = useState<Habit[]>([])
  const [openAdd, setOpenAdd] = useState(false)

  const refetch = async () => {
    const data = await apiJson<Habit[]>('/api/habits')
    setHabits(data ?? [])
  }
  useEffect(() => { if (!loading) refetch() }, [loading, user?.id])

  const last7 = useMemo(() => mounted ? Array.from({ length: 7 }, (_, i) => dateAtMidnight(6 - i)) : [], [mounted])

  const toggle = async (habit: Habit, date: Date) => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to track habits.' }); return }
    const dt = new Date(date); dt.setHours(0,0,0,0)
    const has = habit.logs.some((l) => new Date(l.date).getTime() === dt.getTime())
    setHabits((prev) => prev.map((h) => {
      if (h.id !== habit.id) return h
      return {
        ...h,
        logs: has
          ? h.logs.filter((l) => new Date(l.date).getTime() !== dt.getTime())
          : [...h.logs, { id: 'tmp-' + dt.getTime(), date: dt.toISOString(), completed: true }],
      }
    }))
    await apiFetch(`/api/habits/${habit.id}/log`, { method: 'POST', body: JSON.stringify({ date: dt.toISOString() }) })
    refetch()
  }

  const remove = async (id: string) => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to manage habits.' }); return }
    setHabits((prev) => prev.filter((h) => h.id !== id))
    await apiFetch(`/api/habits/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <PageTitle
        greeting="Tiny things, done often"
        title="Habits"
        subtitle="Be kind to your future self. One ring at a time."
        right={
          <Button onClick={() => setOpenAdd(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            <Plus size={16} className="mr-1.5" /> Add habit
          </Button>
        }
      />

      {habits.length === 0 ? (
        <div className="rounded-2xl p-10 paper-texture text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
          <Sparkles className="w-10 h-10 text-[hsl(var(--primary))]/60 mx-auto mb-3" />
          <div className="font-handwritten text-3xl text-[hsl(var(--foreground))]/80">No habits yet.</div>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Start small — even one is enough.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {habits.map((h, i) => {
              const streak = streakOf(h.logs)
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="group rounded-2xl p-5 paper-texture"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: h.color + '22', color: h.color }}>
                        ✨
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base truncate">{h.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          <span className="flex items-center gap-1 text-[hsl(var(--primary))]">
                            <Flame className="w-3.5 h-3.5" /> {streak}-day streak
                          </span>
                          <span className="text-[hsl(var(--muted-foreground))]">· {h.logs.length} in last 30 days</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {last7.map((d) => {
                        const completed = h.logs.some((l) => new Date(l.date).getTime() === d.getTime())
                        const isToday = d.toDateString() === new Date().toDateString()
                        return (
                          <button
                            key={d.getTime()}
                            onClick={() => toggle(h, d)}
                            className="flex flex-col items-center gap-1 group/cell"
                            aria-label={`Toggle ${d.toDateString()}`}
                          >
                            <div
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                                'group-hover/cell:scale-110',
                                completed
                                  ? 'shadow-md'
                                  : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))]/15',
                                isToday && !completed && 'ring-2 ring-[hsl(var(--primary))]/40'
                              )}
                              style={completed ? { background: h.color, boxShadow: `0 4px 14px -4px ${h.color}` } : {}}
                            >
                              {completed && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className={cn('text-[10px]', isToday ? 'text-[hsl(var(--primary))] font-semibold' : 'text-[hsl(var(--muted-foreground))]')}>
                              {d.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                            </span>
                          </button>
                        )
                      })}
                      <button onClick={() => remove(h.id)} className="ml-2 opacity-0 group-hover:opacity-100 transition text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <AddHabitDialog open={openAdd} onOpenChange={setOpenAdd} onCreated={refetch} />
    </>
  )
}

function AddHabitDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const { user } = useDemoUser()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0]!)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to track habits.' }); return }
    if (!name.trim()) { toast.error('Name your habit ✨'); return }
    setSubmitting(true)
    const res = await apiFetch('/api/habits', { method: 'POST', body: JSON.stringify({ name: name.trim(), color }) })
    setSubmitting(false)
    if (res.ok) { toast.success('A new gentle ritual ✨'); setName(''); onOpenChange(false); onCreated() }
    else toast.error('Could not save.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-3xl text-[hsl(var(--primary))]">A new tiny ritual</DialogTitle>
          <DialogDescription>The smallest habits, done daily, become a life.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Habit name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 rounded-xl" placeholder="e.g. 10 minutes of stretching" maxLength={80} />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Pick a color</Label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  type="button"
                  className={cn('w-9 h-9 rounded-full transition-all hover:scale-110', color === c && 'ring-2 ring-offset-2 ring-[hsl(var(--primary))]')}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            {submitting ? 'Adding…' : 'Add habit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
