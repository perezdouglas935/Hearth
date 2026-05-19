'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { AVATAR_OPTIONS } from '@/lib/avatars'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export function DemoSignInModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[0]!)
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useDemoUser()

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please share a name we can call you.')
      return
    }
    setSubmitting(true)
    const user = await signIn(name.trim(), avatar)
    setSubmitting(false)
    if (user) {
      toast.success(`Welcome to Hearth, ${user.displayName}! \u2728`)
      onOpenChange(false)
      setName('')
    } else {
      toast.error('Something went wrong. Try again?')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border))] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-3xl text-[hsl(var(--primary))] flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Pull up a chair
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            Pick a name and a friendly face. Your cozy little corner of Hearth will be saved on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">What should we call you?</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Robin"
              maxLength={40}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Pick an avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  type="button"
                  className={cn(
                    'aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-200',
                    'hover:scale-110 hover:rotate-3',
                    avatar === a
                      ? 'bg-[hsl(var(--primary))]/15 ring-2 ring-[hsl(var(--primary))] shadow-md'
                      : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))]/10'
                  )}
                  aria-label={`Pick avatar ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Maybe later</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
          >
            {submitting ? 'Settling in…' : 'Get cozy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
