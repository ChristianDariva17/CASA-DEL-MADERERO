import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { ArticlesModule } from './articles/articles.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { CatalogModule } from './catalog/catalog.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { SeedService } from './database/seed.service';
import { DealersModule } from './dealers/dealers.module';
import { NewsletterModule } from './newsletter/newsletter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USER', 'casa'),
        password: config.get<string>('DB_PASSWORD', 'casa'),
        database: config.get<string>('DB_NAME', 'casa_maderero'),
        autoLoadEntities: true,
        // Dev convenience; replace with migrations before production.
        synchronize: config.get('DB_SYNC', 'true') === 'true',
      }),
    }),
    CatalogModule,
    ArticlesModule,
    DealersModule,
    NewsletterModule,
    ComplaintsModule,
    AuthModule,
    OrdersModule,
    AdminModule,
    ContentModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
