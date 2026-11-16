const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const date = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

export const formatPrice = (value: string | number) => currency.format(Number(value))

export const formatDate = (iso: string) => date.format(new Date(`${iso}T00:00:00`))

export const POWER_LABELS = {
  petrol: 'Combustión',
  battery: 'Batería',
  electric: 'Eléctrico',
} as const
