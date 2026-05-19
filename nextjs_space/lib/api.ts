// Client-side helper that injects the demo-user header on every request.

function getOwnerHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem('hearth.demoUser')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { id?: string }
    if (parsed?.id) return { 'x-demo-user': parsed.id }
  } catch {
    /* ignore */
  }
  return {}
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...getOwnerHeader(),
    ...((init.headers as Record<string, string>) ?? {}),
  }
  return fetch(input, { ...init, headers, cache: 'no-store' })
}

export async function apiJson<T = unknown>(input: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const res = await apiFetch(input, init)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
