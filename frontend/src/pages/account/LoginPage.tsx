import { Check, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Field, FormError } from '../../components/ui/Field'
import { darkButton, errorMessage, inputClass, outlineButton } from '../../components/ui/formStyles'
import { PageTitle } from '../../components/ui/PageTitle'
import { HOME_BY_ROLE, safeNext, useAuth } from '../../hooks/authContext'

const BENEFITS = ['Compra online con pago seguro', 'Sigue el estado de tus pedidos', 'Guarda tu carrito entre visitas']

/** "/ingresar": one login for everyone; the role decides where it lands. */
export function LoginPage() {
  const { user, loading, login } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = params.get('next')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && !submitting) {
    return <Navigate to={safeNext(next, user.role) ?? HOME_BY_ROLE[user.role]} replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const signedIn = await login(email, password)
      navigate(safeNext(next, signedIn.role) ?? HOME_BY_ROLE[signedIn.role], { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  const registerLink = next ? `/registro?next=${encodeURIComponent(next)}` : '/registro'

  return (
    <>
      <Breadcrumbs items={[{ label: 'Ingresar' }]} />
      <div className="container-page grid gap-10 pb-20 pt-6 md:grid-cols-2">
        <section>
          <PageTitle className="mb-8">Ingresar</PageTitle>
          <form onSubmit={submit} className="flex max-w-md flex-col gap-5" noValidate>
            <FormError message={error} />
            <Field label="Correo electrónico">
              {(id) => (
                <input
                  id={id}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
            <Field label="Contraseña">
              {(id) => (
                <input
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
            <button type="submit" disabled={submitting} className={darkButton}>
              <LogIn className="h-4 w-4" /> {submitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </section>

        <section className="h-fit bg-surface p-8">
          <h2 className="font-display text-2xl font-extrabold uppercase">¿Primera vez en Casa Maderero?</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {benefit}
              </li>
            ))}
          </ul>
          <Link to={registerLink} className={`${outlineButton} mt-8 bg-white`}>
            Crear una cuenta
          </Link>
        </section>
      </div>
    </>
  )
}
