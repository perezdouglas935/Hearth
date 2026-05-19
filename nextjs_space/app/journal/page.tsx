import { HearthShell } from '@/components/hearth/hearth-shell'
import { JournalClient } from '@/components/hearth/journal/journal-client'

export default function JournalPage() {
  return (
    <HearthShell>
      <JournalClient />
    </HearthShell>
  )
}
