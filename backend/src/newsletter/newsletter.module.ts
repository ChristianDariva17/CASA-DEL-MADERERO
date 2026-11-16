import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Injectable,
  Module,
  Post,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';

@Entity('newsletter_subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}

export class SubscribeDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email: string;
}

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
  ) {}

  async subscribe(rawEmail: string): Promise<{ email: string }> {
    const email = rawEmail.trim().toLowerCase();
    if (await this.subscriptions.exists({ where: { email } })) {
      throw new ConflictException('Este correo ya está suscrito');
    }
    await this.subscriptions.save(this.subscriptions.create({ email }));
    return { email };
  }
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Post()
  @HttpCode(201)
  subscribe(@Body() dto: SubscribeDto) {
    return this.service.subscribe(dto.email);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
