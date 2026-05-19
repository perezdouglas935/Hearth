'use client'

import { useEffect, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiFetch, apiJson } from '@/lib/api'
import { PageTitle } from '@/components/hearth/page-title'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Heart, Briefcase, User, Wallet, Target, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Goal = { id: string; title: string; description: string | null; category: string; progress: number; targetDate: string | null }

const CATEGORY_META: Record<string, { Icon: typeof Heart; tone: string; bg: string }> = {
  health: { Icon: Heart, tone: 'text-[hsl(var(--secondary))]', bg: 'bg-[hsl(var(--secondary))]/15' },
  career: { Icon: Briefcase, tone: 'text-[hsl(220,60%,40%)]', bg: 'bg-[hsl(220,60%,60%)]/15' },
  personal: { Icon: User, tone: 'text-[hsl(var(--primary))]', bg: 'bg-[hsl(var(--primary))]/15' },
  financial: { Icon: Wallet, tone: 'text-[hsl(var(--accent))]', bg: 'bg-[hsl(var(--accent))]/20' },
}

export function GoalsClient() {
  const { user, loading } = useDemoUser()
  const [goals, setGoals] = useState<Goal[]>([])
  const [openAdd, setOpenAdd] = useState(false)

  const refetch = async () => {
    const data = await apiJson<Goal[]>('/api/goals')
    setGoals(data ?? [])
  }
  useEffect(() => { if (!loading) refetch() }, [loading, user?.id])

  const updateProgress = async (id: string, progress: number) => {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, progress } : g))
    await apiFetch(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ progress }) })
  }

  const remove = async (id: string) => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to manage goals.' }); return }
    setGoals((prev) => prev.filter((g) => g.id !== id))
    await apiFetch(`/api/goals/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <PageTitle
        greeting="What you're growing toward"
        title="Goals"
        subtitle="Big or small, every step counts. Be patient with yourself."
        right={
          <Button onClick={() => setOpenAdd(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            <Plus size={16} className="mr-1.5" /> Add goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <div className="rounded-2xl p-10 paper-texture text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
          <Target className="w-10 h-10 text-[hsl(var(--primary))]/60 mx-auto mb-3" />
          <div className="font-handwritten text-3xl text-[hsl(var(--foreground))]/80">A blank slate.</div>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">What's something you'd love to grow toward?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {goals.map((g, i) => {
              const meta = CATEGORY_META[g.category] ?? CATEGORY_META.personal!
              const Icon = meta.Icon
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="group rounded-2xl p-5 paper-texture relative overflow-hidden"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', meta.bg)}>
                        <Icon className={cn('w-5 h-5', meta.tone)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{g.category}</div>
                        <h3 className="font-semibold text-base leading-snug mt-0.5">{g.title}</h3>
                        {g.description && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5 leading-relaxed">{g.description}</p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => remove(g.id)} className="opacity-0 group-hover:opacity-100 transition text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">Progress</span>
                      <span className="font-handwritten text-2xl text-[hsl(var(--primary))]">{g.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.progress}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))] rounded-full"
                      />
                    </div>
                    <div className="mt-3">
                      <Slider
                        value={[g.progress]}
                        max={100}
                        step={5}
                        onValueChange={(v) => updateProgress(g.id, Math.max(0, Math.min(100, v?.[0] ?? 0)))}
                      />
                    </div>
                    {g.targetDate && (
                      <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                        Target: {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <AddGoalDialog open={openAdd} onOpenChange={setOpenAdd} onCreated={refetch} />
    </>
  )
}

function AddGoalDialog({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const { user } = useDemoUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [progress, setProgress] = useState(0)
  const [targetDate, setTargetDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to add goals.' }); return }
    if (!title.trim()) { toast.error('What\u2019s the goal?'); return }
    setSubmitting(true)
    const res = await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        category, progress,
        targetDate: targetDate || null,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success('A wonderful intention ✨')
      setTitle(''); setDescription(''); setProgress(0); setTargetDate('')
      onOpenChange(false); onCreated()
    } else { toast.error('Could not save.') }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-3xl text-[hsl(var(--primary))]">Plant a new goal</DialogTitle>
          <DialogDescription>It doesn't have to be perfect. It just has to be yours.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Goal</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 rounded-xl" placeholder="e.g. Run 3x a week" maxLength={200} />
          </div>
          <div>
            <Label className="text-sm">Why does this matter? (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 rounded-xl resize-none" rows={2} maxLength={400} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Target date (optional)</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
          </div>
          <div>
            <Label className="text-sm">Starting progress: {progress}%</Label>
            <Slider className="mt-2" value={[progress]} max={100} step={5} onValueChange={(v) => setProgress(v?.[0] ?? 0)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            {submitting ? 'Planting…' : 'Add goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
