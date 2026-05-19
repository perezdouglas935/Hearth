'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { apiFetch, apiJson } from '@/lib/api'
import { PageTitle } from '@/components/hearth/page-title'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, BookOpen, Quote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { pickJournalPromptFromDate } from '@/lib/encouragement'

type Entry = { id: string; title: string; content: string; mood: string; createdAt: string }

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', calm: '😌', neutral: '😐', sad: '😔', frustrated: '😤',
}

export function JournalClient() {
  const { user, loading } = useDemoUser()
  const [entries, setEntries] = useState<Entry[]>([])
  const [openAdd, setOpenAdd] = useState(false)

  const refetch = async () => {
    const data = await apiJson<Entry[]>('/api/journal')
    setEntries(data ?? [])
  }
  useEffect(() => { if (!loading) refetch() }, [loading, user?.id])

  const remove = async (id: string) => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to manage journal entries.' }); return }
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await apiFetch(`/api/journal/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <PageTitle
        greeting="A moment of reflection"
        title="Journal"
        subtitle="There's no pressure here. Just you, your thoughts, and a warm cup nearby."
        right={
          <Button onClick={() => setOpenAdd(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            <Plus size={16} className="mr-1.5" /> New entry
          </Button>
        }
      />

      {entries.length === 0 ? (
        <div className="rounded-2xl p-10 paper-texture text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
          <BookOpen className="w-10 h-10 text-[hsl(var(--primary))]/60 mx-auto mb-3" />
          <div className="font-handwritten text-3xl text-[hsl(var(--foreground))]/80">A blank page is waiting.</div>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Whatever's on your mind — there's room for it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {entries.map((e, i) => (
              <motion.article
                key={e.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                className="group rounded-2xl p-6 paper-texture relative overflow-hidden"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                {/* notebook left binding */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[hsl(var(--primary))]/40 to-[hsl(var(--accent))]/30" />
                <div className="pl-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <span className="text-2xl leading-none">{MOOD_EMOJI[e.mood] ?? '😐'}</span>
                        <span>{new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <h3 className="font-handwritten text-3xl text-[hsl(var(--foreground))] mt-2">{e.title}</h3>
                      <p className="text-sm text-[hsl(var(--foreground))]/85 mt-2 leading-relaxed whitespace-pre-line">{e.content}</p>
                    </div>
                    <button onClick={() => remove(e.id)} className="opacity-0 group-hover:opacity-100 transition text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      <NewEntryDialog open={openAdd} onOpenChange={setOpenAdd} onCreated={refetch} />
    </>
  )
}

function NewEntryDialog({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const { user } = useDemoUser()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('calm')
  const [submitting, setSubmitting] = useState(false)
  const prompt = useMemo(() => pickJournalPromptFromDate(), [])

  const submit = async () => {
    if (!user) { toast.message('Browsing as guest', { description: 'Create a demo account to write entries.' }); return }
    if (!title.trim() || !content.trim()) { toast.error('A title and a few words, please ✨'); return }
    setSubmitting(true)
    const res = await apiFetch('/api/journal', { method: 'POST', body: JSON.stringify({ title: title.trim(), content: content.trim(), mood }) })
    setSubmitting(false)
    if (res.ok) { toast.success('Saved — thanks for sharing'); setTitle(''); setContent(''); setMood('calm'); onOpenChange(false); onCreated() }
    else toast.error('Could not save.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-3xl text-[hsl(var(--primary))]">A new entry</DialogTitle>
          <DialogDescription className="flex items-start gap-2 text-sm pt-1">
            <Quote className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 shrink-0" />
            <span>Today's gentle prompt: <em>{prompt}</em></span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 rounded-xl" placeholder="e.g. A small joy today" maxLength={200} />
          </div>
          <div>
            <Label className="text-sm">Today's mood</Label>
            <div className="flex gap-2 mt-1.5">
              {(['happy','calm','neutral','sad','frustrated'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-2xl transition-all',
                    mood === m
                      ? 'bg-[hsl(var(--primary))]/15 ring-2 ring-[hsl(var(--primary))] shadow-md'
                      : 'bg-[hsl(var(--muted))]/60 hover:bg-[hsl(var(--primary))]/10'
                  )}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm">What's on your mind?</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1.5 rounded-xl resize-none"
              rows={6}
              placeholder="Spill some thoughts here… there's no wrong way to do this."
              maxLength={5000}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            {submitting ? 'Saving…' : 'Save entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
