/** A path inside this site. "//host" and "/\host" are not: browsers send both to another site. */
export const isSitePath = (href: string) => /^\/(?![/\\])/.test(href)

export const isExternalUrl = (href: string) => /^https?:\/\//i.test(href)
