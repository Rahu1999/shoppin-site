import { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Light gray background variant */
  gray?: boolean;
  /** No vertical padding (controlled externally) */
  noPadding?: boolean;
}

/** Consistent section container: full-width section + constrained max-width container */
export function SectionWrapper({
  children,
  className = '',
  containerClassName = '',
  gray = false,
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <section
      className={`
        ${gray ? 'bg-gray-50' : 'bg-white'}
        ${noPadding ? '' : 'py-16 md:py-24'}
        ${className}
      `.trim()}
    >
      <div className={`container mx-auto px-4 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

/** Reusable section heading block */
export function SectionHeading({ title, subtitle, centered = false }: SectionHeadingProps) {
  return (
    <div className={`mb-10 md:mb-14 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-gray-500 text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
