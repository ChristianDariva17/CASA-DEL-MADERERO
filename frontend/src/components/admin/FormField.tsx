import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react'
import { useEffect, useId, useState, type ChangeEvent } from 'react'
import { adminApi } from '../../api/client'
import { Field, FormError } from '../ui/Field'
import { errorMessage, inputClass } from '../ui/formStyles'
import {
  str,
  type FaqDraft,
  type FieldDef,
  type Option,
  type SectionDraft,
  type VariantDraft,
} from './fields'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface FormFieldProps {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
}

function useOptions(source: FieldDef['options']): Option[] {
  const [loaded, setLoaded] = useState<Option[]>([])
  useEffect(() => {
    if (typeof source !== 'function') return
    let cancelled = false
    source()
      .then((options) => {
        if (!cancelled) setLoaded(options)
      })
      .catch(() => {
        if (!cancelled) setLoaded([])
      })
    return () => {
      cancelled = true
    }
  }, [source])
  return Array.isArray(source) ? source : loaded
}

/** One admin form control, chosen by the field type. */
export function FormField({ field, value, onChange }: FormFieldProps) {
  const options = useOptions(field.options)
  const wide =
    field.wide ||
    ['textarea', 'keyvalue', 'lines', 'sections', 'checkboxes', 'image', 'variants', 'faqitems'].includes(field.type)
  const className = wide ? 'sm:col-span-2' : ''

  if (field.type === 'checkbox') {
    return (
      <label className={`flex items-center gap-3 text-sm font-bold ${className}`}>
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        {field.label}
      </label>
    )
  }

  if (field.type === 'checkboxes') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    return (
      <fieldset className={className}>
        <legend className="mb-2 text-sm font-bold">{field.label}</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={(e) =>
                  onChange(
                    e.target.checked ? [...selected, option.value] : selected.filter((v) => v !== option.value),
                  )
                }
                className="h-4 w-4 accent-brand"
              />
              {option.label}
            </label>
          ))}
        </div>
        {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
      </fieldset>
    )
  }

  if (field.type === 'image') {
    return <ImageField field={field} value={str(value)} onChange={onChange} />
  }

  if (field.type === 'variants') {
    return (
      <VariantsEditor
        label={field.label}
        hint={field.hint}
        value={Array.isArray(value) ? (value as VariantDraft[]) : []}
        onChange={onChange}
      />
    )
  }

  if (field.type === 'faqitems') {
    return (
      <FaqItemsEditor
        label={field.label}
        hint={field.hint}
        value={Array.isArray(value) ? (value as FaqDraft[]) : []}
        onChange={onChange}
      />
    )
  }

  if (field.type === 'sections') {
    return (
      <SectionsEditor
        label={field.label}
        hint={field.hint}
        value={Array.isArray(value) ? (value as SectionDraft[]) : []}
        onChange={onChange}
      />
    )
  }

  return (
    <Field label={field.label} hint={field.hint} className={className}>
      {(id) => {
        if (field.type === 'textarea' || field.type === 'keyvalue' || field.type === 'lines') {
          const mono = field.type !== 'textarea'
          return (
            <textarea
              id={id}
              rows={mono ? 6 : 4}
              value={str(value)}
              onChange={(e) => onChange(e.target.value)}
              className={`${inputClass} ${mono ? 'font-mono text-xs' : ''}`}
            />
          )
        }
        if (field.type === 'select') {
          return (
            <select id={id} value={str(value)} onChange={(e) => onChange(e.target.value)} className={inputClass}>
              <option value="">Selecciona…</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        }
        return (
          <input
            id={id}
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
            step={field.type === 'number' ? 'any' : undefined}
            value={str(value)}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        )
      }}
    </Field>
  )
}

interface SectionsEditorProps {
  label: string
  hint?: string
  value: SectionDraft[]
  onChange: (value: SectionDraft[]) => void
}

function SectionsEditor({ label, hint, value, onChange }: SectionsEditorProps) {
  const update = (index: number, patch: Partial<SectionDraft>) =>
    onChange(value.map((section, i) => (i === index ? { ...section, ...patch } : section)))

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1 text-sm font-bold">{label}</legend>
      {hint && <p className="mb-3 text-xs text-muted">{hint}</p>}
      <ol className="space-y-4">
        {value.map((section, index) => (
          <li key={index} className="space-y-3 border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase text-muted">Sección {index + 1}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="flex items-center gap-1 text-xs text-muted hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Quitar
              </button>
            </div>
            <input
              aria-label={`Título de la sección ${index + 1}`}
              placeholder="Título de la sección"
              value={section.title}
              onChange={(e) => update(index, { title: e.target.value })}
              className={inputClass}
            />
            <textarea
              aria-label={`Párrafos de la sección ${index + 1}`}
              placeholder="Párrafos (deja una línea en blanco entre párrafos)"
              rows={4}
              value={section.paragraphs}
              onChange={(e) => update(index, { paragraphs: e.target.value })}
              className={inputClass}
            />
            <textarea
              aria-label={`Viñetas de la sección ${index + 1}`}
              placeholder="Viñetas opcionales (una por línea)"
              rows={2}
              value={section.bullets}
              onChange={(e) => update(index, { bullets: e.target.value })}
              className={inputClass}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => onChange([...value, { title: '', paragraphs: '', bullets: '' }])}
        className="mt-3 flex items-center gap-2 text-sm font-bold hover:text-brand"
      >
        <Plus className="h-4 w-4" /> Agregar sección
      </button>
    </fieldset>
  )
}

interface ImageFieldProps {
  field: FieldDef
  value: string
  onChange: (value: string) => void
}

/** URL input with an upload button; the upload fills the URL with the stored file. */
function ImageField({ field, value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileId = useId()

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    // Same limits as the server, checked first so big files never leave the browser.
    if (!UPLOAD_TYPES.includes(file.type)) return setError('Solo se aceptan imágenes JPG, PNG o WebP')
    if (file.size > MAX_UPLOAD_BYTES) return setError('La imagen supera los 5 MB')
    setUploading(true)
    try {
      onChange((await adminApi.upload(file)).url)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="sm:col-span-2">
      <Field label={field.label} hint={field.hint ?? 'Sube una imagen JPG, PNG o WebP de hasta 5 MB, o pega una URL.'}>
        {(id) => (
          <div className="flex flex-wrap items-start gap-3">
            {value ? (
              <img src={value} alt="" className="h-16 w-24 shrink-0 border border-line object-cover" />
            ) : (
              <span className="block h-16 w-24 shrink-0 bg-surface" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <input
                id={id}
                type="text"
                inputMode="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://… o sube una imagen"
                className={inputClass}
              />
              <div className="flex flex-wrap items-center gap-4">
                <label
                  htmlFor={fileId}
                  className={`inline-flex cursor-pointer items-center gap-2 text-sm font-bold hover:text-brand ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <Upload className="h-4 w-4" /> {uploading ? 'Subiendo…' : 'Subir imagen'}
                </label>
                <input
                  id={fileId}
                  type="file"
                  accept={UPLOAD_TYPES.join(',')}
                  onChange={(e) => void upload(e)}
                  className="sr-only"
                />
                {value && (
                  <button type="button" onClick={() => onChange('')} className="text-sm text-muted hover:text-red-700">
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Field>
      <FormError message={error} />
    </div>
  )
}

/** Move up / down / remove buttons for one row of a list editor. */
function RowActions({ index, count, label, onMove, onRemove }: {
  index: number
  count: number
  label: string
  onMove: (from: number, to: number) => void
  onRemove: () => void
}) {
  const icon = 'p-1 text-muted hover:text-ink disabled:opacity-30'
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Subir ${label}`} className={icon}>
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={`Bajar ${label}`}
        className={icon}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label={`Quitar ${label}`} className="p-1 text-muted hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function useList<T>(value: T[], onChange: (value: T[]) => void) {
  return {
    update: (index: number, patch: Partial<T>) =>
      onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row))),
    remove: (index: number) => onChange(value.filter((_, i) => i !== index)),
    move: (from: number, to: number) => {
      const next = [...value]
      const [row] = next.splice(from, 1)
      next.splice(to, 0, row)
      onChange(next)
    },
    add: (row: T) => onChange([...value, row]),
  }
}

interface ListEditorProps<T> {
  label: string
  hint?: string
  value: T[]
  onChange: (value: T[]) => void
}

function VariantsEditor({ label, hint, value, onChange }: ListEditorProps<VariantDraft>) {
  const list = useList(value, onChange)
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1 text-sm font-bold">{label}</legend>
      {hint && <p className="mb-3 text-xs text-muted">{hint}</p>}
      {value.length > 0 && (
        <ol className="space-y-3">
          {value.map((variant, index) => {
            const name = `variante ${index + 1}`
            return (
              <li
                key={variant.id ?? `new-${index}`}
                className="grid gap-2 border border-line bg-surface p-3 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-center"
              >
                <input
                  aria-label={`Nombre de la ${name}`}
                  placeholder="Nombre (ej.: 45 cm)"
                  value={variant.label}
                  onChange={(e) => list.update(index, { label: e.target.value })}
                  className={inputClass}
                />
                <input
                  aria-label={`Referencia de la ${name}`}
                  placeholder="Referencia"
                  value={variant.reference}
                  onChange={(e) => list.update(index, { reference: e.target.value })}
                  className={inputClass}
                />
                <input
                  aria-label={`Precio de la ${name}`}
                  placeholder="Precio S/"
                  type="number"
                  step="any"
                  min="0"
                  value={variant.price}
                  onChange={(e) => list.update(index, { price: e.target.value })}
                  className={inputClass}
                />
                <RowActions
                  index={index}
                  count={value.length}
                  label={`la ${name}`}
                  onMove={list.move}
                  onRemove={() => list.remove(index)}
                />
              </li>
            )
          })}
        </ol>
      )}
      <button
        type="button"
        onClick={() => list.add({ label: '', reference: '', price: '' })}
        className="mt-3 flex items-center gap-2 text-sm font-bold hover:text-brand"
      >
        <Plus className="h-4 w-4" /> Agregar variante
      </button>
    </fieldset>
  )
}

function FaqItemsEditor({ label, hint, value, onChange }: ListEditorProps<FaqDraft>) {
  const list = useList(value, onChange)
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1 text-sm font-bold">{label}</legend>
      {hint && <p className="mb-3 text-xs text-muted">{hint}</p>}
      <ol className="space-y-4">
        {value.map((item, index) => (
          <li key={index} className="space-y-3 border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase text-muted">Pregunta {index + 1}</span>
              <RowActions
                index={index}
                count={value.length}
                label={`la pregunta ${index + 1}`}
                onMove={list.move}
                onRemove={() => list.remove(index)}
              />
            </div>
            <input
              aria-label={`Texto de la pregunta ${index + 1}`}
              placeholder="Pregunta"
              value={item.question}
              onChange={(e) => list.update(index, { question: e.target.value })}
              className={inputClass}
            />
            <textarea
              aria-label={`Respuesta a la pregunta ${index + 1}`}
              placeholder="Respuesta"
              rows={3}
              value={item.answer}
              onChange={(e) => list.update(index, { answer: e.target.value })}
              className={inputClass}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => list.add({ question: '', answer: '' })}
        className="mt-3 flex items-center gap-2 text-sm font-bold hover:text-brand"
      >
        <Plus className="h-4 w-4" /> Agregar pregunta
      </button>
    </fieldset>
  )
}
