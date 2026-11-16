import { Article } from '../src/articles/article.entity';
import { Category } from '../src/catalog/entities/category.entity';
import { ProductVariant } from '../src/catalog/entities/product-variant.entity';
import { Product } from '../src/catalog/entities/product.entity';
import { Complaint } from '../src/complaints/complaints.module';
import {
  FairEvent,
  FaqGroup,
  LegalPage,
  Sector,
} from '../src/content/content.entities';
import { Dealer } from '../src/dealers/dealer.entity';
import { Order, OrderItem } from '../src/orders/order.entity';
import { User } from '../src/users/user.entity';

/**
 * Real Postgres test database (docker-compose service), shared by the
 * Postgres e2e suites; they run one at a time (maxWorkers: 1).
 * Create it once with
 * `docker exec casa-maderero-db psql -U casa -d casa_maderero -c "CREATE DATABASE casa_maderero_test"`.
 */
export const dbOptions = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'casa',
  password: process.env.DB_PASSWORD ?? 'casa',
  database: process.env.TEST_DB_NAME ?? 'casa_maderero_test',
  entities: [
    User,
    Category,
    Product,
    ProductVariant,
    Article,
    Dealer,
    Complaint,
    Order,
    OrderItem,
    Sector,
    FairEvent,
    FaqGroup,
    LegalPage,
  ],
  synchronize: true,
};
