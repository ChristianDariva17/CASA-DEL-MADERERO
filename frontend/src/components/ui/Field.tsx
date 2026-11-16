import { useId } from 'react'

interface FieldProps {
  label: string
  hint?: string
  className?: string
  children: (id: string) => React.ReactNode
}

/** Label + control pair; the render prop receives the id to wire the label. */
export function Field({ label, hint, className = '', children }: FieldProps) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900">
      {message}
    </p>
  )
}
