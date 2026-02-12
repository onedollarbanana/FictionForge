'use client'

import * as React from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  maxItems?: number
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  maxItems = 10,
  placeholder = 'Select options...',
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else if (selected.length < maxItems) {
      onChange([...selected, option])
    }
  }

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(s => s !== option))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected items display / trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex flex-wrap gap-1 min-h-[42px] p-2 border rounded-md cursor-pointer transition-colors',
          'bg-white dark:bg-zinc-900 hover:bg-accent/50',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        {selected.length > 0 ? (
          selected.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-sm bg-primary/10 text-primary rounded-md"
            >
              {item}
              <button
                type="button"
                onClick={(e) => removeOption(item, e)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground text-sm py-0.5">{placeholder}</span>
        )}
        <ChevronDown className={cn(
          'ml-auto h-4 w-4 text-muted-foreground transition-transform self-center',
          isOpen && 'rotate-180'
        )} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-sm bg-transparent outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = selected.includes(option)
                const isDisabled = !isSelected && selected.length >= maxItems

                return (
                  <div
                    key={option}
                    onClick={() => !isDisabled && toggleOption(option)}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer',
                      isSelected && 'bg-primary/10 text-primary',
                      !isSelected && !isDisabled && 'hover:bg-accent',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className={cn(
                      'h-4 w-4 border rounded flex items-center justify-center',
                      isSelected ? 'bg-primary border-primary' : 'border-input'
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    {option}
                  </div>
                )
              })
            ) : (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No options found
              </div>
            )}
          </div>

          {/* Footer with count */}
          <div className="p-2 border-t text-xs text-muted-foreground">
            {selected.length}/{maxItems} selected
          </div>
        </div>
      )}
    </div>
  )
}
