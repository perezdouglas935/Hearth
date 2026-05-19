import { NextRequest } from 'next/server'

/**
 * Get the demo user ID from request headers (sent by client) or null.
 * The client sends the owner id as a header `x-demo-user`.
 * If no header, we treat it as the public demo view (ownerId = null).
 */
export function getOwnerId(req: NextRequest): string | null {
  const id = req.headers.get('x-demo-user')
  if (!id || id === 'null' || id === 'undefined' || id.trim() === '') return null
  return id
}

/**
 * The current view is either the seeded demo data (ownerId=null)
 * OR the demo user's own data (ownerId=<userId>).
 * We return a Prisma where filter for the active view.
 */
export function ownerFilter(ownerId: string | null) {
  return { ownerId: ownerId ?? null }
}
