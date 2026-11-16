import { Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { SocialLinks } from './SocialLinks'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'error'; message: string }

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus({ kind: 'sending' })
    try {
      await api.subscribe(email)
      setStatus({ kind: 'ok' })
      setEmail('')
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Error inesperado' })
    }
  }

  return (
    <section id="newsletter" className="bg-brand py-12 text-ink">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <h2 className="text-lg font-bold md:text-xl">
          ¡No te pierdas nuestras novedades! Suscríbete a nuestro newsletter Casa Maderero.
        </h2>
        <form onSubmit={submit} className="flex w-full max-w-[310px] flex-col gap-3 text-left">
          <label htmlFor="newsletter-email" className="text-sm">
            E-mail
          </label>
          <div className="flex items-center gap-2 border border-ink bg-white px-3">
            <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status.kind === 'sending'}
            className="bg-ink py-3 font-bold uppercase text-white hover:bg-black disabled:opacity-60"
          >
            Suscríbete aquí
          </button>
          <p className="min-h-5 text-sm font-semibold" aria-live="polite">
            {status.kind === 'ok' && '¡Gracias! Te suscribiste correctamente.'}
            {status.kind === 'error' && status.message}
          </p>
        </form>
        <SocialLinks />
      </div>
    </section>
  )
}
