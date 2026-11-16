import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cm.cookie-consent'

type Consent = { analytics: boolean; marketing: boolean }

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Consent) : null
  } catch {
    return null
  }
}

function saveConsent(consent: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  } catch {
    // Storage unavailable: the dialog will show again next visit.
  }
}

/** First-visit cookie dialog with accept / reject / settings. */
export function CookieConsent() {
  const [open, setOpen] = useState(() => readConsent() === null)
  const [settings, setSettings] = useState(false)
  const [choice, setChoice] = useState<Consent>({ analytics: false, marketing: false })

  if (!open) return null

  const decide = (consent: Consent) => {
    saveConsent(consent)
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="grid max-h-[90vh] w-full max-w-3xl gap-6 overflow-y-auto bg-white p-6 shadow-2xl md:grid-cols-[1fr_220px]"
      >
        <div className="text-sm leading-relaxed">
          <h2 id="cookie-title" className="mb-2 text-base font-bold">
            Privacidad
          </h2>
          <p>
            Nuestra página web utiliza cookies y tecnologías similares. Las estrictamente necesarias permiten
            que el sitio funcione; las demás, que solo usaremos con tu consentimiento, sirven para analizar el
            uso del sitio y mostrarte contenido acorde a tus intereses. Puedes cambiar tu decisión en cualquier
            momento desde «Cookies» al final de la página.
          </p>
          <p className="mt-2">
            Más información en nuestra{' '}
            <Link to="/legal/privacidad" className="text-[#1a6aa1] hover:underline">
              Política de Privacidad
            </Link>{' '}
            y{' '}
            <Link to="/legal/cookies" className="text-[#1a6aa1] hover:underline">
              Política de Cookies
            </Link>
            .
          </p>
          {settings && (
            <fieldset className="mt-4 space-y-2 border-t border-line pt-4">
              <legend className="sr-only">Ajustes de cookies</legend>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked disabled /> Necesarias (siempre activas)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={choice.analytics}
                  onChange={(e) => setChoice({ ...choice, analytics: e.target.checked })}
                />
                Analíticas
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={choice.marketing}
                  onChange={(e) => setChoice({ ...choice, marketing: e.target.checked })}
                />
                Publicidad personalizada
              </label>
            </fieldset>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => decide({ analytics: true, marketing: true })}
            className="bg-brand py-3 text-sm font-bold hover:bg-brand-dark"
          >
            Aceptar todas
          </button>
          <button
            type="button"
            onClick={() => decide({ analytics: false, marketing: false })}
            className="bg-brand py-3 text-sm font-bold hover:bg-brand-dark"
          >
            Rechazar todas
          </button>
          {settings ? (
            <button
              type="button"
              onClick={() => decide(choice)}
              className="border border-ink py-3 text-sm font-bold hover:bg-surface"
            >
              Guardar ajustes
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSettings(true)}
              className="border border-ink py-3 text-sm font-bold hover:bg-surface"
            >
              Abrir ajustes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
