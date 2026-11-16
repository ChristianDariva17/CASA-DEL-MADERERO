import { ResourceManager } from '../../components/admin/ResourceManager'
import {
  articleConfig,
  categoryConfig,
  dealerConfig,
  eventConfig,
  faqConfig,
  legalConfig,
  productConfig,
  sectorConfig,
} from './resources'

export const ProductsAdminPage = () => <ResourceManager config={productConfig} />
export const CategoriesAdminPage = () => <ResourceManager config={categoryConfig} />
export const ArticlesAdminPage = () => <ResourceManager config={articleConfig} />
export const DealersAdminPage = () => <ResourceManager config={dealerConfig} />
export const SectorsAdminPage = () => <ResourceManager config={sectorConfig} />
export const EventsAdminPage = () => <ResourceManager config={eventConfig} />
export const FaqsAdminPage = () => <ResourceManager config={faqConfig} />
export const LegalAdminPage = () => <ResourceManager config={legalConfig} />
