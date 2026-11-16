import { BatteryBanner } from '../components/home/BatteryBanner'
import { CategoryStrip } from '../components/home/CategoryStrip'
import { CompetitionTeaser } from '../components/home/CompetitionTeaser'
import { GuidesCarousel } from '../components/home/GuidesCarousel'
import { HeroCarousel } from '../components/home/HeroCarousel'
import { NewProducts } from '../components/home/NewProducts'
import { NewsActual } from '../components/home/NewsActual'
import { NewsGrid } from '../components/home/NewsGrid'
import { RangeIntro } from '../components/home/RangeIntro'
import { ServiceTiles } from '../components/home/ServiceTiles'

/** Home, in the same section order as the reference. */
export function HomePage() {
  return (
    <>
      <HeroCarousel />
      <CategoryStrip />
      <CompetitionTeaser />
      <NewsGrid />
      <BatteryBanner />
      <NewProducts />
      <NewsActual />
      <GuidesCarousel />
      <ServiceTiles />
      <RangeIntro />
    </>
  )
}
