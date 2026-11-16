export const inputClass =
  'w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink disabled:bg-surface'

export const primaryButton =
  'inline-flex items-center justify-center gap-2 bg-brand px-6 py-3 text-sm font-bold text-ink hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60'

export const darkButton =
  'inline-flex items-center justify-center gap-2 bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60'

export const outlineButton =
  'inline-flex items-center justify-center gap-2 border border-ink px-6 py-3 text-sm font-bold hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60'

/** Turns any thrown value into a message for the user. */
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.'
