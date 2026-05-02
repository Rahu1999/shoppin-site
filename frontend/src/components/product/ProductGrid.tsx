import { ReactNode } from 'react';

interface ProductGridProps {
  children: ReactNode;
  /** Number of columns: 2 or 3 (default: 3) */
  cols?: 2 | 3;
}

/** Responsive product grid: 1 col → 2 col → 2 or 3 col */
export function ProductGrid({ children, cols = 3 }: ProductGridProps) {
  const colClass =
    cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-6 md:gap-8`}>
      {children}
    </div>
  );
}
