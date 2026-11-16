interface PageTitleProps {
  children: React.ReactNode
  as?: 'h1' | 'h2'
  className?: string
}

/** Uppercase page heading with the short dark underline bar used across inner pages. */
export function PageTitle({ children, as: Tag = 'h1', className = '' }: PageTitleProps) {
  return (
    <div className={className}>
      <Tag className="font-display text-3xl font-extrabold uppercase leading-tight tracking-wide text-ink md:text-[40px]">
        {children}
      </Tag>
      <span aria-hidden="true" className="mt-3 block h-1 w-9 bg-ink" />
    </div>
  )
}
