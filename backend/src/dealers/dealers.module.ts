import {
  BadRequestException,
  Controller,
  Get,
  Injectable,
  Module,
  Query,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Dealer, DEALER_SERVICES } from './dealer.entity';
import type { DealerService } from './dealer.entity';

export interface DealerQuery {
  search?: string;
  service?: DealerService;
  category?: string;
  origin?: { lat: number; lng: number };
  radiusKm?: number;
}

export type DealerResult = Dealer & { distanceKm: number | null };

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two coordinates (haversine formula). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

@Injectable()
export class DealersService {
  constructor(
    @InjectRepository(Dealer) private readonly dealers: Repository<Dealer>,
  ) {}

  async findAll(query: DealerQuery = {}): Promise<DealerResult[]> {
    const term = query.search?.trim();
    const rows = await this.dealers.find({
      where: term
        ? [
            { city: ILike(`%${term}%`) },
            { region: ILike(`%${term}%`) },
            { name: ILike(`%${term}%`) },
          ]
        : {},
      order: { region: 'ASC', city: 'ASC' },
    });

    const results = rows
      .filter((d) => !query.service || d.services.includes(query.service))
      .filter(
        (d) =>
          !query.category ||
          d.categories.length === 0 ||
          d.categories.includes(query.category),
      )
      .map((d) => ({
        ...d,
        distanceKm:
          query.origin && d.lat !== null && d.lng !== null
            ? Math.round(
                distanceKm(query.origin, { lat: d.lat, lng: d.lng }) * 10,
              ) / 10
            : null,
      }));

    if (!query.origin) return results;
    return results
      .filter(
        (d) =>
          query.radiusKm === undefined ||
          (d.distanceKm !== null && d.distanceKm <= query.radiusKm),
      )
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }
}

function optionalNumber(name: string, value?: string): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new BadRequestException(`${name} must be a number`);
  }
  return parsed;
}

@Controller('dealers')
export class DealersController {
  constructor(private readonly service: DealersService) {}

  @Get()
  findAll(
    @Query('q') search?: string,
    @Query('service') service?: string,
    @Query('category') category?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    if (service && !DEALER_SERVICES.includes(service as DealerService)) {
      throw new BadRequestException(
        `service must be one of: ${DEALER_SERVICES.join(', ')}`,
      );
    }
    const latitude = optionalNumber('lat', lat);
    const longitude = optionalNumber('lng', lng);
    if ((latitude === undefined) !== (longitude === undefined)) {
      throw new BadRequestException('lat and lng must be sent together');
    }
    return this.service.findAll({
      search,
      service: service as DealerService | undefined,
      category: category || undefined,
      origin:
        latitude !== undefined && longitude !== undefined
          ? { lat: latitude, lng: longitude }
          : undefined,
      radiusKm: optionalNumber('radiusKm', radiusKm),
    });
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Dealer])],
  controllers: [DealersController],
  providers: [DealersService],
})
export class DealersModule {}
