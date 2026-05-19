'use client'

import { useState } from 'react'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { PageTitle } from '@/components/hearth/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AVATAR_OPTIONS } from '@/lib/avatars'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Sparkles, LogOut, UserPlus, Sun, Moon } from 'lucide-react'
import { DemoSignInModal } from '@/components/hearth/demo-signin-modal'
import { useTheme } from 'next-themes'

export function SettingsClient() {
  const { user, signOut, updateUser } = useDemoUser()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(user?.displayName ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? AVATAR_OPTIONS[0]!)
  const [openSignIn, setOpenSignIn] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    if (!name.trim()) { toast.error('Add a name first'); return }
    setSaving(true)
    await updateUser({ displayName: name.trim(), avatar })
    setSaving(false)
    toast.success('Saved ✨')
  }

  return (
    <>
      <PageTitle
        greeting="A few preferences"
        title="Settings"
        subtitle="Make Hearth feel a bit more like home."
      />

      <div className="space-y-5">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h2 className="font-handwritten text-3xl mb-1">Your demo account</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            {user ? "Polish your name and pick a face you love." : "Browsing as a guest — create a demo account to make Hearth your own."}
          </p>

          {user ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Display name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 rounded-xl max-w-md" maxLength={40} />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Avatar</Label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-w-md">
                  {AVATAR_OPTIONS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      type="button"
                      className={cn(
                        'aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all hover:scale-105',
                        avatar === a
                          ? 'bg-[hsl(var(--primary))]/15 ring-2 ring-[hsl(var(--primary))]'
                          : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))]/10'
                      )}
                    >{a}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
                  <Sparkles size={14} className="mr-1.5" /> {saving ? 'Saving…' : 'Save changes'}
                </Button>
                <Button variant="ghost" onClick={signOut} className="rounded-xl">
                  <LogOut size={14} className="mr-1.5" /> Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setOpenSignIn(true)} className="rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
              <UserPlus size={14} className="mr-1.5" /> Create demo account
            </Button>
          )}
        </motion.div>

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h2 className="font-handwritten text-3xl mb-1">Theme</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">A warm hearth, day or night.</p>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className={cn('rounded-xl', theme === 'light' && 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white')}
            >
              <Sun size={14} className="mr-1.5" /> Daylight
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className={cn('rounded-xl', theme === 'dark' && 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white')}
            >
              <Moon size={14} className="mr-1.5" /> Cozy night
            </Button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 paper-texture" style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <h2 className="font-handwritten text-3xl mb-1">About Hearth</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            Hearth is a cozy little home for the small acts of looking after yourself — the quiet to-dos, the gentle goals,
            the rhythms that ground us, the words we write to ourselves at the end of the day. There's no streak shaming, no productivity guilt.
            Just a warm fire and a friend pulling up a chair next to yours.
          </p>
        </motion.div>
      </div>

      <DemoSignInModal open={openSignIn} onOpenChange={setOpenSignIn} />
    </>
  )
}
