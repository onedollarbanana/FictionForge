import { Lightbulb, AlertTriangle, Info, StickyNote } from 'lucide-react'
import { ReactNode } from 'react'

const variants = {
  tip: {
    icon: Lightbulb,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  note: {
    icon: StickyNote,
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
}

export function GuideCallout({
  variant = 'info',
  children,
}: {
  variant?: 'tip' | 'warning' | 'info' | 'note'
  children: ReactNode
}) {
  const { icon: Icon, borderColor, bgColor, iconColor } = variants[variant]

  return (
    <div className={`flex gap-3 ${bgColor} border-l-4 ${borderColor} p-4 rounded-r-lg my-4`}>
      <Icon className={`h-5 w-5 ${iconColor} mt-0.5 shrink-0`} />
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
