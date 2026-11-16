const NETWORKS: { name: string; path: string }[] = [
  {
    name: 'Instagram',
    path: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM3 7.5A4.5 4.5 0 0 1 7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9Z',
  },
  {
    name: 'Facebook',
    path: 'M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2Z',
  },
  {
    name: 'YouTube',
    path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z',
  },
  {
    name: 'TikTok',
    path: 'M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.3-1.6Z',
  },
  {
    name: 'LinkedIn',
    path: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm4.3 15V10H5.8v8h2.5ZM7 8.9a1.5 1.5 0 1 0 0-2.9 1.5 1.5 0 0 0 0 2.9ZM18.3 18v-4.4c0-2.4-1.3-3.5-3-3.5a2.6 2.6 0 0 0-2.4 1.3V10h-2.4v8h2.5v-4c0-1 .2-2.1 1.5-2.1s1.3 1.2 1.3 2.2V18h2.5Z',
  },
]

/** Generic social icons (simple glyphs, not official brand artwork). */
export function SocialLinks() {
  return (
    <ul className="flex items-center gap-5">
      {NETWORKS.map((network) => (
        <li key={network.name}>
          <a href="#" aria-label={`Casa Maderero en ${network.name}`} className="block hover:opacity-70">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d={network.path} fillRule="evenodd" />
            </svg>
          </a>
        </li>
      ))}
      <li className="font-display text-xl font-extrabold">#CASAMADERERO</li>
    </ul>
  )
}
