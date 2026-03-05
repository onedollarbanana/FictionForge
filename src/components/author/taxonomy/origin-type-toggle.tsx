'use client'

import { ORIGIN_TYPES, type OriginType } from '@/lib/constants'

interface OriginTypeToggleProps {
  value: 'original' | 'fan_fiction'
  onChange: (value: 'original' | 'fan_fiction') => void
}

export function OriginTypeToggle({ value, onChange }: OriginTypeToggleProps) {
  return (
    <div className="flex gap-2">
      {ORIGIN_TYPES.map((type: OriginType) => {
        const isSelected = value === type.value
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-border bg-card hover:border-amber-500/40'
            }`}
          >
            <span className={`font-semibold text-sm ${isSelected ? 'text-amber-700 dark:text-amber-300' : ''}`}>
              {type.label}
            </span>
            <span className="text-xs text-muted-foreground text-center">{type.description}</span>
          </button>
        )
      })}
    </div>
  )
}
