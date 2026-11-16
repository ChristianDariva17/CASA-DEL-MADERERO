import { useEffect, useState } from 'react'

export interface ApiState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

/** Runs an async loader whenever `deps` change and exposes its state. */
export function useApi<T>(loader: () => Promise<T>, deps: readonly unknown[]): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: true })

  // `deps` is the caller-provided dependency list, like useEffect itself.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))
    loader()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            loading: false,
          })
        }
      })
    return () => {
      cancelled = true
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
