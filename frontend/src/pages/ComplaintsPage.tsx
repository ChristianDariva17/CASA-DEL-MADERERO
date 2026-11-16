import { CheckCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { ComplaintInput } from '../api/types'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'

type FormState = Omit<ComplaintInput, 'amount'> & { amount: string; accepted: boolean }

const EMPTY: FormState = {
  kind: 'reclamo',
  fullName: '',
  documentType: 'DNI',
  documentNumber: '',
  email: '',
  phone: '',
  address: '',
  productOrService: '',
  amount: '',
  detail: '',
  request: '',
  accepted: false,
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; code: string; createdAt: string; complaintKind: ComplaintInput['kind'] }

/** "/libro-de-reclamaciones": consumer complaints book form. */
export function ComplaintsPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus({ kind: 'sending' })
    const { accepted: _accepted, amount, ...rest } = form
    try {
      const result = await api.createComplaint({ ...rest, amount: amount ? Number(amount) : undefined })
      setStatus({ kind: 'done', ...result, complaintKind: rest.kind })
      setForm(EMPTY)
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Error inesperado' })
    }
  }

  const input = 'w-full border border-ink bg-white px-3 py-2.5 text-sm outline-none focus:border-brand'
  const label = 'flex flex-col gap-1.5 text-sm'

  return (
    <>
      <Breadcrumbs items={[{ label: 'Información legal', to: '/legal/informacion-legal' }, { label: 'Libro de Reclamaciones' }]} />
      <div className="container-page pb-20">
        <PageTitle className="mb-6 mt-6 px-2">Libro de Reclamaciones</PageTitle>
        <p className="max-w-3xl text-sm leading-relaxed">
          Conforme al Código de Protección y Defensa del Consumidor, contamos con un Libro de Reclamaciones a tu
          disposición. Responderemos en un plazo máximo de 15 días hábiles.
        </p>

        {status.kind === 'done' ? (
          <div role="status" className="mt-10 max-w-3xl border-l-4 border-brand bg-surface p-6">
            <p className="flex items-center gap-2 text-lg font-bold">
              <CheckCircle2 className="h-6 w-6 text-brand" /> Registramos tu {status.complaintKind}
            </p>
            <p className="mt-2 text-sm">
              Código de seguimiento: <strong className="text-lg">{status.code}</strong>. Te enviaremos la respuesta al
              correo indicado.
            </p>
            <button
              type="button"
              onClick={() => setStatus({ kind: 'idle' })}
              className="mt-4 text-sm font-bold underline hover:text-brand"
            >
              Registrar otro
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 grid max-w-3xl gap-8">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-4 font-display text-xl font-extrabold uppercase">1. Datos del consumidor</legend>
              <label className={`${label} sm:col-span-2`}>
                Nombre completo *
                <input required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={input} autoComplete="name" />
              </label>
              <label className={label}>
                Tipo de documento *
                <select value={form.documentType} onChange={(e) => set('documentType', e.target.value as FormState['documentType'])} className={input}>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </label>
              <label className={label}>
                Número de documento *
                <input required value={form.documentNumber} onChange={(e) => set('documentNumber', e.target.value)} className={input} inputMode="numeric" />
              </label>
              <label className={label}>
                Correo electrónico *
                <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} autoComplete="email" />
              </label>
              <label className={label}>
                Teléfono *
                <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input} autoComplete="tel" />
              </label>
              <label className={`${label} sm:col-span-2`}>
                Dirección *
                <input required value={form.address} onChange={(e) => set('address', e.target.value)} className={input} autoComplete="street-address" />
              </label>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-4 font-display text-xl font-extrabold uppercase">2. Bien contratado</legend>
              <label className={label}>
                Producto o servicio *
                <input required value={form.productOrService} onChange={(e) => set('productOrService', e.target.value)} className={input} />
              </label>
              <label className={label}>
                Monto reclamado (S/)
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} className={input} />
              </label>
            </fieldset>

            <fieldset className="grid gap-4">
              <legend className="mb-4 font-display text-xl font-extrabold uppercase">3. Detalle</legend>
              <div className="flex gap-6 text-sm" role="radiogroup" aria-label="Tipo">
                {(
                  [
                    ['reclamo', 'Reclamo', 'Disconformidad con el producto o servicio.'],
                    ['queja', 'Queja', 'Malestar con la atención recibida.'],
                  ] as const
                ).map(([value, title, hint]) => (
                  <label key={value} className="flex cursor-pointer items-start gap-2">
                    <input type="radio" name="kind" checked={form.kind === value} onChange={() => set('kind', value)} className="mt-1 accent-[#f37a1f]" />
                    <span>
                      <strong>{title}</strong>
                      <br />
                      <span className="text-muted">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className={label}>
                Detalle *
                <textarea required rows={5} value={form.detail} onChange={(e) => set('detail', e.target.value)} className={input} />
              </label>
              <label className={label}>
                Pedido *
                <textarea required rows={3} value={form.request} onChange={(e) => set('request', e.target.value)} className={input} />
              </label>
            </fieldset>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required checked={form.accepted} onChange={(e) => set('accepted', e.target.checked)} className="mt-1 accent-[#f37a1f]" />
              Acepto el tratamiento de mis datos según el aviso de privacidad para la atención de este reclamo.
            </label>

            {status.kind === 'error' && (
              <p role="alert" className="border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
                {status.message}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <button
                type="submit"
                disabled={status.kind === 'sending'}
                className="bg-ink px-8 py-3 font-bold uppercase text-white hover:bg-black disabled:opacity-60"
              >
                {status.kind === 'sending' ? 'Enviando…' : 'Enviar'}
              </button>
              <ArrowLink to="/legal/privacidad">Aviso de privacidad</ArrowLink>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
