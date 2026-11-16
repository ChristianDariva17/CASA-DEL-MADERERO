import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isExternalUrl, isSitePath } from './links'

/**
 * Renders the small text format the admin panel uses for FAQ answers and
 * legal pages, building React elements (never HTML strings):
 * - a blank line separates paragraphs; a single line break stays a break
 * - lines starting with "- " form a bullet list
 * - [texto](/ruta) links inside the site, [texto](https://…) or (mailto:…) outside
 * - **texto** in bold
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        if (lines.every((line) => line.trimStart().startsWith('- '))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-6">
              {lines.map((line, j) => (
                <li key={j}>{inline(line.trimStart().slice(2))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(line)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index
    if (at > last) nodes.push(text.slice(last, at))
    const [, label, href, bold] = match
    if (bold !== undefined) {
      nodes.push(<strong key={at}>{bold}</strong>)
    } else {
      nodes.push(<RichLink key={at} href={href} label={label} />)
    }
    last = at + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function RichLink({ href, label }: { href: string; label: string }) {
  if (isSitePath(href)) {
    return (
      <Link to={href} className="underline hover:text-brand">
        {label}
      </Link>
    )
  }
  // Anything but http(s) and mailto (e.g. "javascript:") stays plain text.
  const external = isExternalUrl(href)
  if (!external && !/^mailto:/i.test(href)) return <>{label}</>
  return (
    <a
      href={href}
      className="underline hover:text-brand"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  )
}
