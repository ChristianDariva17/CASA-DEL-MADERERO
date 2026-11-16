import { ArrowLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { adminApi, type AdminResource } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { FormError } from '../ui/Field'
import { darkButton, errorMessage, outlineButton } from '../ui/formStyles'
import { StateMessage } from '../ui/StateMessage'
import { FormField } from './FormField'
import type { FieldDef, FormValues } from './fields'

export interface Column<T> {
  label: string
  render: (item: T) => React.ReactNode
  className?: string
}

export interface ResourceConfig<T extends { id: number }> {
  resource: AdminResource
  title: string
  /** Lower-case singular used in buttons and messages, e.g. "producto". */
  singular: string
  columns: Column<T>[]
  fields: FieldDef[]
  /** Text the list search matches against. */
  searchText: (item: T) => string
  toForm: (item?: T) => FormValues
  toPayload: (values: FormValues) => unknown
  /** Label used in the delete confirmation. */
  describe: (item: T) => string
}

/** List + create/edit form + delete for one admin resource. */
export function ResourceManager<T extends { id: number }>({ config }: { config: ResourceConfig<T> }) {
  const [version, setVersion] = useState(0)
  const list = useApi(() => adminApi.list<T>(config.resource), [config.resource, version])
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const items = list.data ?? []
    return q ? items.filter((item) => config.searchText(item).toLowerCase().includes(q)) : items
  }, [list.data, query, config])

  const reload = (message: string) => {
    setEditing(null)
    setNotice(message)
    setVersion((v) => v + 1)
    window.scrollTo({ top: 0 })
  }

  const remove = async (item: T) => {
    if (!window.confirm(`¿Eliminar ${config.singular} "${config.describe(item)}"? Esta acción no se puede deshacer.`)) {
      return
    }
    setListError(null)
    try {
      await adminApi.remove(config.resource, item.id)
      reload(`Se eliminó ${config.singular} "${config.describe(item)}".`)
    } catch (err) {
      setListError(errorMessage(err))
    }
  }

  if (editing) {
    return (
      <ResourceForm
        key={editing === 'new' ? 'new' : editing.id}
        config={config}
        item={editing === 'new' ? undefined : editing}
        onCancel={() => setEditing(null)}
        onSaved={(saved) => reload(`Se guardó ${config.singular} "${config.describe(saved)}".`)}
      />
    )
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold uppercase">{config.title}</h1>
        <button
          type="button"
          onClick={() => {
            setNotice(null)
            setEditing('new')
          }}
          className={darkButton}
        >
          <Plus className="h-4 w-4" /> Nuevo {config.singular}
        </button>
      </div>

      {notice && (
        <p role="status" className="mb-4 bg-green-50 px-4 py-3 text-sm text-green-900">
          {notice}
        </p>
      )}
      <FormError message={listError} />

      <label className="mb-4 mt-2 flex max-w-sm items-center gap-2 border border-line bg-white px-3">
        <Search className="h-4 w-4 text-muted" aria-hidden="true" />
        <span className="sr-only">Buscar</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar…"
          className="w-full py-2 text-sm outline-none"
        />
      </label>

      <StateMessage loading={list.loading && !list.data} error={list.error} empty={list.data?.length === 0} />
      {!!list.data?.length && (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.label} className={`px-4 py-3 ${column.className ?? ''}`}>
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((item) => (
                <tr key={item.id} className="hover:bg-[#fafafa]">
                  {config.columns.map((column) => (
                    <td key={column.label} className={`px-4 py-3 ${column.className ?? ''}`}>
                      {column.render(item)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null)
                        setEditing(item)
                      }}
                      className="mr-1 inline-flex items-center gap-1 p-1.5 font-bold hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      aria-label={`Eliminar ${config.describe(item)}`}
                      className="inline-flex items-center p-1.5 text-muted hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">Sin coincidencias.</p>}
        </div>
      )}
      {!!list.data?.length && (
        <p className="mt-3 text-xs text-muted">
          {visible.length} de {list.data.length}
        </p>
      )}
    </section>
  )
}

interface ResourceFormProps<T extends { id: number }> {
  config: ResourceConfig<T>
  item?: T
  onCancel: () => void
  onSaved: (saved: T) => void
}

function ResourceForm<T extends { id: number }>({ config, item, onCancel, onSaved }: ResourceFormProps<T>) {
  const [values, setValues] = useState<FormValues>(() => config.toForm(item))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = config.toPayload(values)
      const saved = item
        ? await adminApi.update<T>(config.resource, item.id, payload)
        : await adminApi.create<T>(config.resource, payload)
      onSaved(saved)
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <section>
      <button type="button" onClick={onCancel} className="mb-4 flex items-center gap-2 text-sm font-bold hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> {config.title}
      </button>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">
        {item ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
      </h1>
      <form onSubmit={submit} className="grid max-w-3xl gap-5 border border-line bg-white p-6 sm:grid-cols-2" noValidate>
        {error && (
          <div className="sm:col-span-2">
            <FormError message={error} />
          </div>
        )}
        {config.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
          />
        ))}
        <div className="flex flex-wrap gap-3 border-t border-line pt-5 sm:col-span-2">
          <button type="submit" disabled={saving} className={darkButton}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" onClick={onCancel} className={outlineButton}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
