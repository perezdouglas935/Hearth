'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiFetch, apiJson } from '@/lib/api'
import { useMounted } from '@/hooks/use-mounted'
import { PageTitle } from '@/components/hearth/page-title'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from 'sonner'

type EventT = { id: string; title: string; description: string | null; startTime: string; endTime: string | null; category: string; location: string | null }

const CATEGORY_DOTS: Record<string, string> = {
  work: 'bg-[hsl(220,60%,60%)]',
  personal: 'bg-[hsl(var(--primary))]',
  health: 'bg-[hsl(var(--secondary))]',
  social: 'bg-[hsl(var(--accent))]',
}

const CATEGORY_PILL: Record<string, string> = {
  work: 'bg-[hsl(220,60%,60%)]/15 text-[hsl(220,60%,40%)]',
  personal: 'bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]',
  health: 'bg-[hsl(var(--secondary))]/20 text-[hsl(99,30%,30%)]',
  social: 'bg-[hsl(var(--accent))]/20 text-[hsl(28,40%,30%)]',
}

function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

// Use a fixed reference date (Jan 1 2000) for SSR; updated on mount.
const SSR_REF = new Date(2000, 0, 1)

export function CalendarClient() {
  const { user, loading } = useDemoUser()
  const mounted = useMounted()
  const [events, setEvents] = useState<EventT[]>([])
  const [view, setView] = useState<Date>(() => startOfMonth(SSR_REF))
  const [selected, setSelected] = useState<Date>(SSR_REF)
  const [openAdd, setOpenAdd] = useState(false)

  // Once mounted, initialise to the actual current date
  useEffect(() => {
    if (!mounted) return
    const today = new Date(); today.setHours(0,0,0,0)
    setView(startOfMonth(today))
    setSelected(today)
  }, [mounted])

  const refetch = async () => {
    const data = await apiJson<EventT[]>('/api/events')
    setEvents(data ?? [])
  }
  useEffect(() => { if (!loading) refetch() }, [loading, user?.id])

  // Build the 6-row grid
  const cells = useMemo(() => {
    const start = startOfMonth(view)
    const startDow = start.getDay() // Sun=0
    const monthIdx = view.getMonth()
    const list: Date[] = []
    const first = new Date(start)
    first.setDate(first.getDate() - startDow)
    for (let i = 0; i < 42; i++) {
      const d = new Date(first); d.setDate(first.getDate() + i)
      list.push(d)
    }
    return { list, monthIdx }
  }, [view])

  const eventsByDay = useMemo(() => {
    const m = new Map<string, EventT[]>()
    for (const e of events) {
      const d = new Date(e.startTime); d.setHours(0,0,0,0)
      const k = d.toDateString()
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(e)
    }
    return m
  }, [events])

  const dayEvents = (eventsByDay.get(selected.toDateString()) ?? []).slice().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const remove = async (id: string) => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to manage events.' }); return }
    setEvents((prev) => prev.filter((e) => e.id !== id))
    await apiFetch(`/api/events/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <PageTitle
        greeting="What's coming up"
        title="Calendar"
        subtitle="A soft, thoughtful look at your weeks ahead."
        right={
          <Button onClick={() => setOpenAdd(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            <Plus size={16} className="mr-1.5" /> Add event
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl p-5 paper-texture"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-handwritten text-3xl">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setView((v) => { const n = new Date(v); n.setMonth(n.getMonth() - 1); return n })}
                className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition" aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setView(startOfMonth(new Date()))}
                className="px-3 py-1.5 rounded-xl text-xs hover:bg-[hsl(var(--muted))] transition">Today</button>
              <button onClick={() => setView((v) => { const n = new Date(v); n.setMonth(n.getMonth() + 1); return n })}
                className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition" aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <div key={d} className="text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.list.map((d, i) => {
              const inMonth = d.getMonth() === cells.monthIdx
              const isSel = sameDay(d, selected)
              const isToday = mounted && sameDay(d, new Date())
              const dayEv = eventsByDay.get(d.toDateString()) ?? []
              return (
                <button
                  key={i}
                  onClick={() => setSelected(d)}
                  className={cn(
                    'h-16 sm:h-20 rounded-xl p-1.5 text-left transition-all',
                    'hover:bg-[hsl(var(--primary))]/10',
                    !inMonth && 'opacity-40',
                    isSel ? 'bg-[hsl(var(--primary))]/15 ring-1 ring-[hsl(var(--primary))]' : 'bg-[hsl(var(--card))]',
                    isToday && !isSel && 'bg-[hsl(var(--accent))]/15'
                  )}
                >
                  <div className={cn(
                    'text-xs font-medium',
                    isToday && 'text-[hsl(var(--primary))]'
                  )}>{d.getDate()}</div>
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {dayEv.slice(0, 4).map((e) => (
                      <span key={e.id} className={cn('w-1.5 h-1.5 rounded-full', CATEGORY_DOTS[e.category] ?? 'bg-[hsl(var(--primary))]')} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-5 paper-texture"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            {selected.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <h3 className="font-handwritten text-3xl text-[hsl(var(--primary))]">
            {selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {dayEvents.length === 0 ? 'A peaceful, open day.' : `${dayEvents.length} ${dayEvents.length === 1 ? 'thing' : 'things'} on the calendar`}
          </p>

          <div className="mt-4 space-y-2">
            <AnimatePresence>
              {dayEvents.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="group rounded-xl p-3 bg-[hsl(var(--muted))]/40 hover:bg-[hsl(var(--muted))]/70 transition"
                >
                  <div className="flex items-start gap-2">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full mt-0.5', CATEGORY_PILL[e.category] ?? '')}>
                      {e.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-1"><Clock size={11} />
                          {new Date(e.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          {e.endTime && ' – ' + new Date(e.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {e.location && <span className="flex items-center gap-1 truncate"><MapPin size={11} />{e.location}</span>}
                      </div>
                    </div>
                    <button onClick={() => remove(e.id)} className="opacity-0 group-hover:opacity-100 transition text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AddEventDialog open={openAdd} onOpenChange={setOpenAdd} onCreated={refetch} defaultDate={selected} />
    </>
  )
}

function AddEventDialog({
  open, onOpenChange, onCreated, defaultDate,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void; defaultDate: Date }) {
  const { user } = useDemoUser()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [category, setCategory] = useState('personal')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      const iso = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}-${String(defaultDate.getDate()).padStart(2, '0')}`
      setDate(iso)
    }
  }, [open, defaultDate])

  const submit = async () => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to add events.' }); return }
    if (!title.trim() || !date) { toast.error('A title and date, please ✨'); return }
    setSubmitting(true)
    const startTime = new Date(`${date}T${time || '09:00'}:00`)
    const res = await apiFetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        startTime: startTime.toISOString(),
        category,
        location: location || null,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success('Penciled in ✨')
      setTitle(''); setLocation('')
      onOpenChange(false)
      onCreated()
    } else { toast.error('Could not save. Try again?') }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-3xl text-[hsl(var(--primary))]">A new plan</DialogTitle>
          <DialogDescription>Something to look forward to.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 rounded-xl" placeholder="e.g. Coffee with Alex" maxLength={200} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm">Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Where (optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5 rounded-xl" placeholder="e.g. Café down the road" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            {submitting ? 'Saving…' : 'Add to calendar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
