import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { RequireAuth } from './components/auth/RequireAuth'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './hooks/AuthProvider'
import { CartProvider } from './hooks/CartProvider'
import { AccountPage } from './pages/account/AccountPage'
import { LoginPage } from './pages/account/LoginPage'
import { OrderPage } from './pages/account/OrderPage'
import { RegisterPage } from './pages/account/RegisterPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { OrdersAdminPage } from './pages/admin/OrdersAdminPage'
import { ComplaintsAdminPage, CustomersAdminPage } from './pages/admin/PeopleAdminPages'
import {
  ArticlesAdminPage,
  CategoriesAdminPage,
  DealersAdminPage,
  EventsAdminPage,
  FaqsAdminPage,
  LegalAdminPage,
  ProductsAdminPage,
  SectorsAdminPage,
} from './pages/admin/ResourcePages'
import { ArticlePage } from './pages/ArticlePage'
import { CampaignPage } from './pages/CampaignPage'
import { CatalogOverviewPage } from './pages/CatalogOverviewPage'
import { CategoryPage } from './pages/CategoryPage'
import { ComparePage } from './pages/ComparePage'
import { CompetitionPage } from './pages/CompetitionPage'
import { ComplaintsPage } from './pages/ComplaintsPage'
import { ContactPage } from './pages/ContactPage'
import { DealersPage } from './pages/DealersPage'
import { EventsPage } from './pages/EventsPage'
import { FaqPage } from './pages/FaqPage'
import { HomePage } from './pages/HomePage'
import { LegalPage } from './pages/LegalPage'
import { ManualsPage } from './pages/ManualsPage'
import { NewsPage } from './pages/NewsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProfessionalPage } from './pages/ProfessionalPage'
import { SearchPage } from './pages/SearchPage'
import { SectorPage } from './pages/SectorPage'
import { ServicesPage } from './pages/ServicesPage'
import { CartPage } from './pages/shop/CartPage'
import { CheckoutPage } from './pages/shop/CheckoutPage'
import { PaymentPage } from './pages/shop/PaymentPage'
import { SizeGuidePage } from './pages/SizeGuidePage'
import { TipsPage } from './pages/TipsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="productos" element={<CatalogOverviewPage kind="machine" />} />
              <Route path="accesorios" element={<CatalogOverviewPage kind="accessory" />} />
              <Route path="productos/:category" element={<CategoryPage />} />
              <Route path="producto/:slug" element={<ProductDetailPage />} />
              <Route path="busqueda" element={<SearchPage />} />
              <Route path="comparar" element={<ComparePage />} />
              <Route path="distribuidores" element={<DealersPage />} />
              <Route path="profesional" element={<ProfessionalPage />} />
              <Route path="profesional/:sector" element={<SectorPage />} />
              <Route path="ferias-y-eventos" element={<EventsPage />} />
              <Route path="experiencia/copa-de-hacheros" element={<CompetitionPage />} />
              <Route path="campanas/:slug" element={<CampaignPage />} />
              <Route path="guia-de-tallas" element={<SizeGuidePage />} />
              <Route path="consejos" element={<TipsPage />} />
              <Route path="informacion-y-servicios" element={<ServicesPage />} />
              <Route path="noticias" element={<NewsPage />} />
              <Route path="articulos/:slug" element={<ArticlePage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="preguntas-frecuentes" element={<FaqPage />} />
              <Route path="manuales" element={<ManualsPage />} />
              <Route path="legal/:slug" element={<LegalPage />} />
              <Route path="libro-de-reclamaciones" element={<ComplaintsPage />} />

              <Route path="ingresar" element={<LoginPage />} />
              <Route path="registro" element={<RegisterPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route element={<RequireAuth />}>
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="pago/:code" element={<PaymentPage />} />
                <Route path="mi-cuenta" element={<AccountPage />} />
                <Route path="mi-cuenta/pedidos/:code" element={<OrderPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<RequireAuth role="admin" />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="pedidos" element={<OrdersAdminPage />} />
                <Route path="productos" element={<ProductsAdminPage />} />
                <Route path="categorias" element={<CategoriesAdminPage />} />
                <Route path="articulos" element={<ArticlesAdminPage />} />
                <Route path="distribuidores" element={<DealersAdminPage />} />
                <Route path="sectores" element={<SectorsAdminPage />} />
                <Route path="eventos" element={<EventsAdminPage />} />
                <Route path="preguntas" element={<FaqsAdminPage />} />
                <Route path="legales" element={<LegalAdminPage />} />
                <Route path="clientes" element={<CustomersAdminPage />} />
                <Route path="reclamos" element={<ComplaintsAdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
