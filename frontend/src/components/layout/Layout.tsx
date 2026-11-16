import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CompareProvider } from '../../hooks/CompareProvider'
import { CompareBar } from './CompareBar'
import { CookieConsent } from './CookieConsent'
import { Footer } from './Footer'
import { Header } from './Header'
import { Newsletter } from './Newsletter'

export function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, hash])

  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
          Ir al contenido
        </a>
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Newsletter />
        <Footer />
        <CompareBar />
        <CookieConsent />
      </div>
    </CompareProvider>
  )
}
