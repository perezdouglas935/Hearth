'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiFetch, apiJson } from '@/lib/api'
import { PageTitle } from '@/components/hearth/page-title'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ChevronDown, Folder, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from 'sonner'

type Task = { id: string; title: string; project: string; priority: string; completed: boolean; dueDate: string | null }

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-[hsl(var(--secondary))]',
  medium: 'bg-[hsl(var(--accent))]',
  high: 'bg-[hsl(var(--primary))]',
}

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low priority',
  medium: 'Medium priority',
  high: 'High priority',
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Done' },
] as const
type FilterKey = typeof FILTERS[number]['key']

function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString() }

export function TasksClient() {
  const { user, loading } = useDemoUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<FilterKey>('all')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [openAdd, setOpenAdd] = useState(false)

  const refetch = async () => {
    const data = await apiJson<Task[]>('/api/tasks')
    setTasks(data ?? [])
  }

  useEffect(() => {
    if (loading) return
    refetch()
  }, [loading, user?.id])

  const filtered = useMemo(() => {
    const today = new Date()
    return (tasks ?? []).filter((t) => {
      if (filter === 'completed') return t.completed
      if (filter === 'today') return t.dueDate && sameDay(new Date(t.dueDate), today) && !t.completed
      if (filter === 'upcoming') return t.dueDate && new Date(t.dueDate) > today && !t.completed
      return true
    })
  }, [tasks, filter])

  const grouped = useMemo(() => {
    const m = new Map<string, Task[]>()
    for (const t of filtered) {
      const key = t.project ?? 'Other'
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(t)
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const completedToday = (tasks ?? []).filter((t) => t.completed && t.dueDate && sameDay(new Date(t.dueDate), new Date())).length

  const toggle = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed } : t))
    await apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) })
  }

  const remove = async (id: string) => {
    if (!user) {
      toast.message('Browsing as guest', { description: 'Create a demo account to manage tasks.' })
      return
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  const projectsList = useMemo(() => Array.from(new Set((tasks ?? []).map((t) => t.project))), [tasks])

  return (
    <>
      <PageTitle
        greeting="Your gentle to-do list"
        title="Tasks"
        subtitle={`${completedToday} ${completedToday === 1 ? 'task' : 'tasks'} completed today \u2014 keep that momentum going!`}
        right={
          <Button onClick={() => setOpenAdd(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            <Plus size={16} className="mr-1.5" /> Add task
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm transition-all',
              filter === f.key
                ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--primary))]/10 text-[hsl(var(--muted-foreground))]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl p-10 paper-texture text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
          <ListTodo className="w-10 h-10 text-[hsl(var(--primary))]/60 mx-auto mb-3" />
          <div className="font-handwritten text-3xl text-[hsl(var(--foreground))]/80">All clear here.</div>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Take a breath. Or start something small.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([project, items]) => {
            const isCollapsed = collapsed[project] ?? false
            const doneCount = items.filter((i) => i.completed).length
            return (
              <motion.div
                key={project}
                whileHover={{ y: -2 }}
                className="rounded-2xl paper-texture overflow-hidden"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [project]: !isCollapsed }))}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[hsl(var(--primary))]/5 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                    <Folder className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-base">{project}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{doneCount} of {items.length} done</div>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', isCollapsed && '-rotate-90')} />
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {items.map((t) => (
                        <li key={t.id} className="group flex items-start gap-3 px-4 py-3 border-t border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))]/40 transition">
                          <Checkbox
                            checked={t.completed}
                            onCheckedChange={(v) => toggle(t.id, !!v)}
                            className="mt-1 data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-sm', t.completed && 'line-through text-[hsl(var(--muted-foreground))]')}>{t.title}</div>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                              <span className="flex items-center gap-1">
                                <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOTS[t.priority] ?? 'bg-[hsl(var(--muted))]')} />
                                {PRIORITY_LABEL[t.priority] ?? t.priority}
                              </span>
                              {t.dueDate && (
                                <span>{new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 transition text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      <AddTaskDialog
        open={openAdd}
        onOpenChange={setOpenAdd}
        existingProjects={projectsList}
        onCreated={refetch}
      />
    </>
  )
}

function AddTaskDialog({
  open, onOpenChange, existingProjects, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; existingProjects: string[]; onCreated: () => void }) {
  const { user } = useDemoUser()
  const [title, setTitle] = useState('')
  const [project, setProject] = useState(existingProjects[0] ?? 'Personal Growth')
  const [newProject, setNewProject] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      toast.message('Browsing as guest', { description: 'Create a demo account to add your own tasks.' })
      return
    }
    if (!title.trim()) { toast.error('Give it a name first ✨'); return }
    const finalProject = (newProject.trim() || project || 'Personal').slice(0, 80)
    setSubmitting(true)
    const res = await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        project: finalProject,
        priority,
        dueDate: dueDate || null,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success('Added to your list ✨')
      setTitle(''); setNewProject(''); setDueDate(''); setPriority('medium')
      onOpenChange(false)
      onCreated()
    } else {
      toast.error('Could not save. Try again?')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-3xl text-[hsl(var(--primary))]">Add a new task</DialogTitle>
          <DialogDescription>One small step at a time — you've got this.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">What needs doing?</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Water the plants" className="mt-1.5 rounded-xl" maxLength={200} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(existingProjects.length ? existingProjects : ['Personal Growth']).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm">Or create a new project (optional)</Label>
            <Input value={newProject} onChange={(e) => setNewProject(e.target.value)} placeholder="e.g. Garden" className="mt-1.5 rounded-xl" maxLength={80} />
          </div>

          <div>
            <Label className="text-sm">Due date (optional)</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1.5 rounded-xl" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            {submitting ? 'Adding…' : 'Add task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
