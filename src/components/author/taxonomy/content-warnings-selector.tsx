'use client'

import { CONTENT_WARNING_GROUPS, type ContentWarningItem } from '@/lib/content-warnings'

interface ContentWarningsSelectorProps {
  value: string[]
  onChange: (warnings: string[]) => void
}

export function ContentWarningsSelector({ value, onChange }: ContentWarningsSelectorProps) {
  const toggle = (warningValue: string) => {
    if (value.includes(warningValue)) {
      onChange(value.filter(w => w !== warningValue))
    } else {
      onChange([...value, warningValue])
    }
  }

  const noneSelected = value.length === 0

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Content warnings support reader safety, not moral judgment. Select everything that applies to your story.
      </p>

      {CONTENT_WARNING_GROUPS.map(group => (
        <div key={group.name} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{group.name}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {group.warnings.map((warning: ContentWarningItem) => (
              <label
                key={warning.value}
                className="flex items-center gap-2.5 text-sm cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={value.includes(warning.value)}
                  onChange={() => toggle(warning.value)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-amber-500 focus:ring-amber-500"
                />
                <span className="group-hover:text-foreground transition-colors">{warning.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <label className="flex items-center gap-2.5 text-sm cursor-pointer border-t pt-3">
        <input
          type="checkbox"
          checked={noneSelected}
          onChange={() => noneSelected ? null : onChange([])}
          readOnly={!noneSelected}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-muted-foreground">None of the above</span>
      </label>

      {value.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {value.length} warning{value.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
