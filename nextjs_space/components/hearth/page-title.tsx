import { ReactNode } from 'react'

export function PageTitle({
  greeting,
  title,
  subtitle,
  right,
}: {
  greeting?: string
  title: string
  subtitle?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
      <div>
        {greeting && (
          <div className="font-handwritten text-2xl text-[hsl(var(--primary))]/85 mb-1">{greeting}</div>
        )}
        <h1 className="font-handwritten text-5xl md:text-6xl tracking-tight leading-[1] text-[hsl(var(--foreground))]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[hsl(var(--muted-foreground))] mt-2 max-w-xl">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  )
}
