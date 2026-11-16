import {
  Axe,
  Droplet,
  Droplets,
  Fuel,
  HardHat,
  Leaf,
  Scissors,
  SprayCan,
  TreePine,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  chainsaw: Axe,
  trimmer: Leaf,
  pump: Droplets,
  sprayer: SprayCan,
  washer: Droplet,
  hedge: Scissors,
  pole: TreePine,
  blower: Wind,
  shield: HardHat,
  oil: Fuel,
}

interface CategoryIconProps {
  icon: string
  className?: string
  strokeWidth?: number
}

export function CategoryIcon({ icon, className, strokeWidth = 1.5 }: CategoryIconProps) {
  const Icon = ICONS[icon] ?? Wrench
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}
