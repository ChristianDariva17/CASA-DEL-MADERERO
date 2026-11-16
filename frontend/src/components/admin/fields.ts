import type { ArticleSection } from '../../api/types'

export interface Option {
  value: string
  label: string
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'url'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'checkboxes'
  | 'keyvalue'
  | 'sections'
  /** URL input plus "Subir imagen". */
  | 'image'
  | 'variants'
  | 'faqitems'
  /** One value per line ↔ string[]. */
  | 'lines'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  hint?: string
  wide?: boolean
  /** Static options, or loaded when the form opens (select / checkboxes). */
  options?: Option[] | (() => Promise<Option[]>)
}

export type FormValues = Record<string, unknown>

/** "Clave: valor" per line ↔ { clave: valor }. */
export function specsToText(specs: Record<string, string> | undefined): string {
  return Object.entries(specs ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

export function textToSpecs(text: string): Record<string, string> {
  const specs: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const at = line.indexOf(':')
    if (at <= 0) continue
    const key = line.slice(0, at).trim()
    const value = line.slice(at + 1).trim()
    if (key && value) specs[key] = value
  }
  return specs
}

/** "Mezcla Lista: ventajas" → "mezcla-lista-ventajas". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface SectionDraft {
  /** Existing anchor id; kept so links like "#resumen" survive an edit. */
  id?: string
  title: string
  paragraphs: string
  bullets: string
}

export const sectionToDraft = (s: ArticleSection): SectionDraft => ({
  id: s.id,
  title: s.title,
  paragraphs: s.paragraphs.join('\n\n'),
  bullets: (s.bullets ?? []).join('\n'),
})

/** Paragraphs are separated by a blank line, bullets by a line break. */
export function draftToSection(draft: SectionDraft, index: number): ArticleSection {
  const bullets = draft.bullets
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean)
  return {
    id: draft.id || slugify(draft.title) || `seccion-${index + 1}`,
    title: draft.title.trim(),
    paragraphs: draft.paragraphs
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    ...(bullets.length ? { bullets } : {}),
  }
}

export const str = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value))

/** Empty input → undefined, so optional numbers are left out of the payload. */
export const optionalNumber = (value: unknown) => (str(value).trim() === '' ? undefined : Number(value))

/** Product variant row in the form; prices stay strings while typing. */
export interface VariantDraft {
  id?: number
  label: string
  reference: string
  price: string
}

export interface FaqDraft {
  question: string
  answer: string
}

export const linesToList = (text: unknown) =>
  str(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
