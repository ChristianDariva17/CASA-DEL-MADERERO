interface SectionHeadingProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function SectionHeading({ children, as: Tag = 'h2', className = '' }: SectionHeadingProps) {
  return (
    <Tag
      className={`font-display text-3xl font-extrabold uppercase leading-tight tracking-wide text-ink md:text-4xl ${className}`}
    >
      {children}
    </Tag>
  )
}
