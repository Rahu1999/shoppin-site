import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export function StarRating({ rating, count, size = 'md', showCount = false, className }: StarRatingProps) {
  const numericCount = Number(count) || 0;

  if (!numericCount) {
    return showCount ? (
      <span className={cn('text-xs text-slate-400', className)}>No reviews yet</span>
    ) : null;
  }

  const numericRating = Number(rating) || 0;
  const starClass = SIZE_CLASSES[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              starClass,
              i <= Math.round(numericRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            )}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-slate-500">
          {numericRating.toFixed(1)} ({numericCount})
        </span>
      )}
    </div>
  );
}
