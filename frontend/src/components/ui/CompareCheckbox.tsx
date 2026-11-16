import { useState } from 'react'
import { MAX_COMPARE, useCompare } from '../../hooks/compareContext'

interface CompareCheckboxProps {
  slug: string
  name: string
}

export function CompareCheckbox({ slug, name }: CompareCheckboxProps) {
  const compare = useCompare()
  const [full, setFull] = useState(false)
  const checked = compare.has(slug)

  return (
    <label className="relative z-10 inline-flex cursor-pointer items-center gap-2 text-[15px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setFull(!compare.toggle({ slug, name }))}
        className="h-5 w-5 cursor-pointer appearance-none border border-ink bg-white bg-center bg-no-repeat checked:border-brand checked:bg-brand checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22><path d=%22M5 12l5 5L20 7%22/></svg>')]"
      />
      Comparar
      {full && !checked && (
        <span role="status" className="absolute left-0 top-full mt-1 whitespace-nowrap text-xs text-red-700">
          Máximo {MAX_COMPARE} productos
        </span>
      )}
    </label>
  )
}
