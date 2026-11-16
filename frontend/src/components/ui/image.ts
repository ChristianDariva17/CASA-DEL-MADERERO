/** Builds a sized, compressed URL for Unsplash images; other URLs pass through. */
export function sizedImage(url: string, width: number, height?: number): string {
  if (!url.startsWith('https://images.unsplash.com/')) return url
  const params = new URLSearchParams({ w: String(width), auto: 'format', q: '70' })
  if (height) {
    params.set('h', String(height))
    params.set('fit', 'crop')
  }
  return `${url}?${params.toString()}`
}
