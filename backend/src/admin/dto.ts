import { applyDecorators } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  isURL,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateBy,
  ValidateNested,
} from 'class-validator';
import { CATEGORY_KINDS } from '../catalog/entities/category.entity';
import type { CategoryKind } from '../catalog/entities/category.entity';
import { DEALER_SERVICES } from '../dealers/dealer.entity';
import type { DealerService } from '../dealers/dealer.entity';
import { ORDER_STATUSES } from '../orders/order.entity';
import type { OrderStatus } from '../orders/order.entity';

export const POWER_SOURCES = ['petrol', 'battery', 'electric'] as const;
export const ARTICLE_KINDS = ['news', 'guide'] as const;

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MESSAGE = 'El slug solo admite minúsculas, números y guiones';

export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
/** Empty strings become null so optional image fields can be cleared. */
const emptyToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export const Required = (field: string, max = 200) =>
  applyDecorators(
    Transform(trim),
    IsString(),
    IsNotEmpty({ message: `${field} es obligatorio` }),
    MaxLength(max),
  );

/** A file stored by the uploads endpoint, e.g. "/api/uploads/<uuid>.png". */
export const UPLOADED_IMAGE =
  /^\/api\/uploads\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/;

const isImageUrl = (value: unknown) =>
  typeof value === 'string' &&
  (UPLOADED_IMAGE.test(value) ||
    isURL(value, { protocols: ['https', 'http'], require_protocol: true }));

export const OptionalImage = () =>
  applyDecorators(
    Transform(emptyToNull),
    IsOptional(),
    ValidateBy(
      { name: 'isImageUrl', validator: { validate: isImageUrl } },
      {
        message:
          'La imagen debe ser una URL válida (https://…) o una imagen subida',
      },
    ),
  );

export class VariantDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'La variante necesita un nombre' })
  @MaxLength(80)
  label: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  reference?: string;

  @IsNumber({}, { message: 'El precio de la variante debe ser un número' })
  @Min(0.01, { message: 'El precio de la variante debe ser mayor que 0' })
  @Max(1_000_000)
  price: number;
}

export class ProductDto {
  @Required('El nombre', 120)
  name: string;

  @Transform(trim)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  slug: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  reference?: string;

  @Required('El resumen', 500)
  summary: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0.01, { message: 'El precio debe ser mayor que 0' })
  @Max(1_000_000)
  price: number;

  @IsIn(POWER_SOURCES, { message: 'Selecciona un accionamiento válido' })
  powerSource: (typeof POWER_SOURCES)[number];

  @IsInt({ message: 'Selecciona una categoría' })
  categoryId: number;

  @OptionalImage()
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  /** When sent, replaces the whole variant set in this order. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class UpdateProductDto extends PartialType(ProductDto) {}

export class CategoryDto {
  @Required('El nombre', 80)
  name: string;

  @Transform(trim)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsIn(CATEGORY_KINDS, { message: 'Selecciona máquinas o accesorios' })
  kind: CategoryKind;

  @OptionalImage()
  imageUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateCategoryDto extends PartialType(CategoryDto) {}

export class ArticleSectionDto {
  @Transform(trim)
  @Matches(SLUG, {
    message: 'El id de sección solo admite minúsculas, números y guiones',
  })
  id: string;

  @Required('El título de la sección', 160)
  title: string;

  @IsArray()
  @IsString({ each: true })
  paragraphs: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bullets?: string[];
}

export class ArticleDto {
  @Required('El título', 200)
  title: string;

  @Transform(trim)
  @Matches(SLUG, { message: SLUG_MESSAGE })
  slug: string;

  @IsIn(ARTICLE_KINDS, { message: 'Selecciona noticia o consejo' })
  kind: (typeof ARTICLE_KINDS)[number];

  @Required('El extracto', 500)
  excerpt: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  lead?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  body?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleSectionDto)
  sections?: ArticleSectionDto[];

  @OptionalImage()
  imageUrl?: string | null;

  @IsDateString({}, { message: 'Ingresa una fecha de publicación válida' })
  publishedAt: string;
}

export class UpdateArticleDto extends PartialType(ArticleDto) {}

export class DealerDto {
  @Required('El nombre', 120)
  name: string;

  @Required('La ciudad', 80)
  city: string;

  @Required('La región', 80)
  region: string;

  @Required('La dirección', 200)
  address: string;

  @Required('El teléfono', 40)
  phone: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number | null;

  @IsArray()
  @IsIn(DEALER_SERVICES, { each: true, message: 'Servicio no válido' })
  services: DealerService[];

  @IsArray()
  @Matches(SLUG, { each: true, message: 'Categoría no válida' })
  categories: string[];
}

export class UpdateDealerDto extends PartialType(DealerDto) {}

export class OrderStatusDto {
  @IsIn(ORDER_STATUSES, { message: 'Estado de pedido no válido' })
  status: OrderStatus;
}
