import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api/client'
import type { FaqItem as Faq } from '../api/types'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { RichText } from '../components/ui/RichText'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'

/** "/preguntas-frecuentes": grouped question accordions. */
export function FaqPage() {
  const groups = useApi(() => api.faqs(), [])
  const { hash } = useLocation()

  // Groups arrive after the first render, so jump to "#baterias" once they do.
  useEffect(() => {
    if (groups.data && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [groups.data, hash])

  return (
    <>
      <Breadcrumbs items={[{ label: 'Información y servicios', to: '/informacion-y-servicios' }, { label: 'Preguntas frecuentes (FAQs)' }]} />
      <div className="container-page pb-20">
        <PageTitle className="mb-12 mt-6 px-2">Preguntas frecuentes (FAQs)</PageTitle>
        <StateMessage loading={groups.loading} error={groups.error} empty={groups.data?.length === 0} />
        <div className="space-y-14">
          {groups.data?.map((group) => (
            <section key={group.id} id={group.slug} className="scroll-mt-48">
              <h2 className="font-display text-2xl font-extrabold uppercase">{group.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed">{group.intro}</p>
              <ul className="mt-6 max-w-3xl border-t border-line">
                {group.items.map((item) => (
                  <FaqItem key={item.question} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

function FaqItem({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold hover:text-brand"
      >
        {item.question}
        {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {open && <RichText text={item.answer} className="space-y-3 pb-5 text-sm leading-relaxed" />}
    </li>
  )
}
