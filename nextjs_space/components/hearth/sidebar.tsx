'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Sun, ListTodo, Calendar as CalendarIcon, Target, Sparkles,
  BookOpen, LayoutDashboard, Settings, Menu, X, LogOut, UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlameLogo } from './flame-logo'
import { useDemoUser } from '@/components/providers/demo-user-provider'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { DemoSignInModal } from './demo-signin-modal'

const NAV = [
  { href: '/', label: 'Today', icon: Sun },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/habits', label: 'Habits', icon: Sparkles },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const { user, signOut } = useDemoUser()

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[hsl(var(--card))]/85 backdrop-blur border-b border-[hsl(var(--border))]">
        <Link href="/" className="flex items-center gap-2">
          <FlameLogo size={28} />
          <span className="font-handwritten text-2xl text-[hsl(var(--primary))]">Hearth</span>
        </Link>
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 px-4 py-6',
          'bg-[hsl(var(--card))]/70 backdrop-blur-md border-r border-[hsl(var(--border))]/60',
        )}
      >
        <SidebarContent pathname={pathname} onNavigate={() => {}} onSignInClick={() => setSignInOpen(true)} user={user} signOut={signOut} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-[hsl(var(--card))] shadow-2xl px-4 py-6 overflow-y-auto"
            >
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setOpen(false)}
                onSignInClick={() => { setOpen(false); setSignInOpen(true) }}
                user={user}
                signOut={signOut}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <DemoSignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  )
}

function SidebarContent({
  pathname, onNavigate, onSignInClick, user, signOut,
}: {
  pathname: string
  onNavigate: () => void
  onSignInClick: () => void
  user: { id: string; displayName: string; avatar: string } | null
  signOut: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-2 mb-8">
        <FlameLogo size={36} />
        <div>
          <div className="font-handwritten text-3xl leading-none text-[hsl(var(--primary))]">Hearth</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">your cozy life planner</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-[hsl(var(--primary))]/10',
                active
                  ? 'bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.3)]'
                  : 'text-[hsl(var(--foreground))]/80'
              )}
            >
              <Icon size={18} className={cn('transition-transform group-hover:scale-110', active && 'text-[hsl(var(--primary))]')} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6">
        {user ? (
          <div className="rounded-2xl p-3 bg-gradient-to-br from-[hsl(var(--primary))]/12 to-[hsl(var(--accent))]/12 border border-[hsl(var(--primary))]/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--card))] flex items-center justify-center text-xl shadow-sm">
                {user.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{user.displayName}</div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))]">demo session</div>
              </div>
            </div>
            <button
              onClick={() => { signOut(); onNavigate(); }}
              className="mt-3 w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg bg-[hsl(var(--card))]/70 hover:bg-[hsl(var(--card))] transition text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 border border-[hsl(var(--primary))]/15">
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
              You're browsing as a guest. Create a demo account to add your own tasks, goals, and journal.
            </div>
            <Button
              onClick={onSignInClick}
              size="sm"
              className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white shadow-md"
            >
              <UserPlus size={14} className="mr-1.5" /> Create demo account
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
