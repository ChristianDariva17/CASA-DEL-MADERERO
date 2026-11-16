import { applyDecorators } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  OptionalImage,
  Required,
  SLUG,
  SLUG_MESSAGE,
  trim,
} from '../admin/dto';
import { EVENT_KINDS } from './content.entities';
import type { EventKind } from './content.entities';

const Slug = () =>
  applyDecorators(Transform(trim), Matches(SLUG, { message: SLUG_MESSAGE }));

/**
 * A site path ("/ruta") or an http(s) URL; empty means no link. "//host" and
 * "/\host" are rejected: browsers treat both as links to another site.
 */
const LINK = /^(?:\/(?![/\\])\S*|https?:\/\/\S+)?$/;

export class SectorDto {
  @Slug()
  slug: string;

  @Required('El título', 120)
  title: string;

  @Required('El título de máquinas', 120)
  machinesTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  intro?: string;

  @OptionalImage()
  imageUrl?: string | null;

  @IsArray()
  @Matches(SLUG, { each: true, message: 'Categoría no válida' })
  categories: string[];

  @IsArray()
  @Matches(SLUG, { each: true, message: 'Producto no válido' })
  productSlugs: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class EventDto {
  @Required('El nombre', 160)
  name: string;

  @IsIn(EVENT_KINDS, {
    message: 'Selecciona feria, demostración o competencia',
  })
  kind: EventKind;

  @Required('La ciudad', 80)
  city: string;

  @IsDateString({}, { message: 'Ingresa una fecha de inicio válida' })
  startDate: string;

  @IsDateString({}, { message: 'Ingresa una fecha de fin válida' })
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Transform(trim)
  @Matches(LINK, {
    message: 'El enlace debe empezar con "/" o con https://',
  })
  @MaxLength(300)
  link?: string;
}

export class FaqItemDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Cada pregunta necesita su texto' })
  @MaxLength(300)
  question: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Cada pregunta necesita una respuesta' })
  @MaxLength(5000)
  answer: string;
}

export class FaqGroupDto {
  @Slug()
  slug: string;

  @Required('El título', 120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  intro?: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items: FaqItemDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class LegalPageDto {
  @Slug()
  slug: string;

  @Required('El título', 160)
  title: string;

  @IsString()
  @MaxLength(50000)
  body: string;
}

export class UpdateSectorDto extends PartialType(SectorDto) {}
export class UpdateEventDto extends PartialType(EventDto) {}
export class UpdateFaqGroupDto extends PartialType(FaqGroupDto) {}
export class UpdateLegalPageDto extends PartialType(LegalPageDto) {}
