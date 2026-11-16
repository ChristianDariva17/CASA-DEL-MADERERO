interface StateMessageProps {
  loading: boolean
  error: Error | null
  empty?: boolean
  emptyText?: string
}

/** Renders loading / error / empty feedback; returns null when content is ready. */
export function StateMessage({ loading, error, empty, emptyText = 'No hay resultados.' }: StateMessageProps) {
  if (loading) {
    return <p className="py-10 text-center text-muted">Cargando…</p>
  }
  if (error) {
    return (
      <p role="alert" className="border-l-4 border-brand bg-surface px-4 py-3 text-sm">
        No se pudo cargar el contenido. Verifica que la API esté en ejecución. ({error.message})
      </p>
    )
  }
  if (empty) {
    return <p className="py-10 text-center text-muted">{emptyText}</p>
  }
  return null
}
