import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  HttpCode,
  Injectable,
  Module,
  Post,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';

export const COMPLAINT_KINDS = ['reclamo', 'queja'] as const;
export const DOCUMENT_TYPES = ['DNI', 'CE', 'Pasaporte', 'RUC'] as const;

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Entry of the "Libro de Reclamaciones" (consumer complaints book). */
@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar' })
  kind: (typeof COMPLAINT_KINDS)[number];

  @Column()
  fullName: string;

  @Column({ type: 'varchar' })
  documentType: (typeof DOCUMENT_TYPES)[number];

  @Column()
  documentNumber: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  productOrService: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount: string | null;

  @Column({ type: 'text' })
  detail: string;

  @Column({ type: 'text' })
  request: string;

  @CreateDateColumn()
  createdAt: Date;
}

export class CreateComplaintDto {
  @IsIn(COMPLAINT_KINDS, { message: 'Selecciona reclamo o queja' })
  kind: (typeof COMPLAINT_KINDS)[number];

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ingresa tu nombre completo' })
  @MaxLength(120)
  fullName: string;

  @IsIn(DOCUMENT_TYPES, { message: 'Selecciona un tipo de documento válido' })
  documentType: (typeof DOCUMENT_TYPES)[number];

  @Transform(trim)
  @Matches(/^[A-Za-z0-9]{8,12}$/, {
    message: 'El número de documento debe tener entre 8 y 12 caracteres',
  })
  documentNumber: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email: string;

  @Transform(trim)
  @Matches(/^\+?[0-9 ]{6,15}$/, { message: 'Ingresa un teléfono válido' })
  phone: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ingresa tu dirección' })
  @MaxLength(200)
  address: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Indica el producto o servicio' })
  @MaxLength(200)
  productOrService: string;

  @IsOptional()
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0)
  amount?: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Describe el detalle de tu reclamo o queja' })
  @MaxLength(2000)
  detail: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Indica tu pedido' })
  @MaxLength(1000)
  request: string;
}

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaints: Repository<Complaint>,
  ) {}

  async create(
    dto: CreateComplaintDto,
  ): Promise<{ code: string; createdAt: Date }> {
    // The public code derives from the row id, so concurrent submissions never collide.
    return this.complaints.manager.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(Complaint, {
          ...dto,
          amount: dto.amount === undefined ? null : dto.amount.toFixed(2),
          code: `pending-${randomUUID()}`,
        }),
      );
      saved.code = `R-${saved.createdAt.getFullYear()}-${String(saved.id).padStart(6, '0')}`;
      await manager.save(saved);
      return { code: saved.code, createdAt: saved.createdAt };
    });
  }
}

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateComplaintDto) {
    return this.service.create(dto);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Complaint])],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
})
export class ComplaintsModule {}
