import { HearthShell } from '@/components/hearth/hearth-shell'
import { TasksClient } from '@/components/hearth/tasks/tasks-client'

export default function TasksPage() {
  return (
    <HearthShell>
      <TasksClient />
    </HearthShell>
  )
}
