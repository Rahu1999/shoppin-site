'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function StarPicker({ value, onChange, className }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'h-7 w-7 transition-colors',
              i <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}
