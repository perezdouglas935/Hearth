import { HearthShell } from '@/components/hearth/hearth-shell'
import { DashboardClient } from '@/components/hearth/dashboard/dashboard-client'

export default function DashboardPage() {
  return (
    <HearthShell>
      <DashboardClient />
    </HearthShell>
  )
}
