'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

export type DemoUser = {
  id: string
  displayName: string
  avatar: string
}

type DemoUserContextType = {
  user: DemoUser | null
  loading: boolean
  signIn: (displayName: string, avatar: string) => Promise<DemoUser | null>
  signOut: () => void
  updateUser: (data: Partial<Pick<DemoUser, 'displayName' | 'avatar'>>) => Promise<void>
}

const DemoUserContext = createContext<DemoUserContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signOut: () => {},
  updateUser: async () => {},
})

const STORAGE_KEY = 'hearth.demoUser'

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on mount only
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as DemoUser
        if (parsed?.id && parsed?.displayName) setUser(parsed)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (displayName: string, avatar: string) => {
    try {
      const res = await fetch('/api/demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatar }),
      })
      if (!res.ok) return null
      const data = (await res.json()) as DemoUser
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } catch {
      return null
    }
  }, [])

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  const updateUser = useCallback(async (data: Partial<Pick<DemoUser, 'displayName' | 'avatar'>>) => {
    if (!user) return
    try {
      const res = await fetch(`/api/demo-user/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return
      const updated = (await res.json()) as DemoUser
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setUser(updated)
    } catch {
      /* ignore */
    }
  }, [user])

  return (
    <DemoUserContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </DemoUserContext.Provider>
  )
}

export function useDemoUser() {
  return useContext(DemoUserContext)
}
