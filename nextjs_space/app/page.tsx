import { HearthShell } from '@/components/hearth/hearth-shell'
import { TodayClient } from '@/components/hearth/today/today-client'

export default function HomePage() {
  return (
    <HearthShell>
      <TodayClient />
    </HearthShell>
  )
}
