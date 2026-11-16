import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Field, FormError } from '../../components/ui/Field'
import { darkButton, errorMessage, inputClass } from '../../components/ui/formStyles'
import { PageTitle } from '../../components/ui/PageTitle'
import { HOME_BY_ROLE, safeNext, useAuth } from '../../hooks/authContext'

/** "/registro": customer sign-up (admins are created on the server). */
export function RegisterPage() {
  const { user, loading, register } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = params.get('next')
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && !submitting) {
    return <Navigate to={safeNext(next, user.role) ?? HOME_BY_ROLE[user.role]} replace />
  }

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: e.target.value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const created = await register(form.fullName, form.email, form.password)
      navigate(safeNext(next, created.role) ?? HOME_BY_ROLE[created.role], { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Ingresar', to: '/ingresar' }, { label: 'Crear cuenta' }]} />
      <div className="container-page pb-20 pt-6">
        <PageTitle className="mb-8">Crear cuenta</PageTitle>
        <form onSubmit={submit} className="grid max-w-2xl gap-5 sm:grid-cols-2" noValidate>
          {error && (
            <div className="sm:col-span-2">
              <FormError message={error} />
            </div>
          )}
          <Field label="Nombre completo" className="sm:col-span-2">
            {(id) => (
              <input id={id} autoComplete="name" value={form.fullName} onChange={update('fullName')} className={inputClass} />
            )}
          </Field>
          <Field label="Correo electrónico" className="sm:col-span-2">
            {(id) => (
              <input
                id={id}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Contraseña" hint="Mínimo 8 caracteres">
            {(id) => (
              <input
                id={id}
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Repite la contraseña">
            {(id) => (
              <input
                id={id}
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={update('confirm')}
                className={inputClass}
              />
            )}
          </Field>
          <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
            <button type="submit" disabled={submitting} className={darkButton}>
              {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
            <Link
              to={next ? `/ingresar?next=${encodeURIComponent(next)}` : '/ingresar'}
              className="text-sm font-bold hover:text-brand"
            >
              Ya tengo una cuenta
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
