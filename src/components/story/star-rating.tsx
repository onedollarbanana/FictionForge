'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number; // 0-5, supports half stars
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const displayValue = hoverValue ?? value;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const handleMouseMove = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (readonly || !onChange) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    
    setHoverValue(index + (isHalf ? 0.5 : 1));
  };
  
  const handleClick = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (readonly || !onChange) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    
    onChange(index + (isHalf ? 0.5 : 1));
  };
  
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = displayValue >= index + 1;
        const halfFilled = !filled && displayValue > index && displayValue < index + 1;
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            className={cn(
              'relative focus:outline-none',
              !readonly && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onMouseMove={(e) => handleMouseMove(index, e)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={(e) => handleClick(index, e)}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                'text-zinc-300 dark:text-zinc-600'
              )}
            />
            
            {/* Filled star overlay */}
            {(filled || halfFilled) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: halfFilled ? '50%' : '100%' }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    'fill-amber-400 text-amber-400'
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
      
      {showValue && displayValue > 0 && (
        <span className="ml-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}
