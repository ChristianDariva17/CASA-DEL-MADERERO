import {
  Body,
  ConflictException,
  Controller,
  Get,
  Global,
  HttpCode,
  Injectable,
  Logger,
  Module,
  OnApplicationBootstrap,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { compare, hash, hashSync } from 'bcryptjs';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Repository } from 'typeorm';
import { User, toPublicUser } from '../users/user.entity';
import type { PublicUser } from '../users/user.entity';
import { AuthGuard, CurrentUser } from './auth.guard';
import type { JwtPayload } from './auth.guard';

const BCRYPT_ROUNDS = 10;
/** Compared against when the email is unknown, so timing does not reveal accounts. */
const DUMMY_HASH = hashSync('not-a-real-password', BCRYPT_ROUNDS);

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Ingresa tu contraseña' })
  @MaxLength(72)
  password: string;
}

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'Ingresa tu nombre completo' })
  @MaxLength(120)
  fullName: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  // bcrypt ignores everything after 72 bytes.
  @MaxLength(72, { message: 'La contraseña puede tener hasta 72 caracteres' })
  password: string;
}

export interface Session {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Session> {
    const exists = await this.users.exists({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Ya existe una cuenta con este correo');
    }
    const user = await this.users.save(
      this.users.create({
        email: dto.email,
        fullName: dto.fullName,
        passwordHash: await hash(dto.password, BCRYPT_ROUNDS),
        // Public sign-up only ever creates customers.
        role: 'customer',
      }),
    );
    return this.session(user);
  }

  async login(dto: LoginDto): Promise<Session> {
    const user = await this.users.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        passwordHash: true,
      },
    });
    const valid = await compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.session(user);
  }

  /** Creates the first admin from the environment when no admin exists yet. */
  async ensureAdmin(email: string, password: string, fullName: string) {
    const hasAdmin = await this.users.exists({ where: { role: 'admin' } });
    if (hasAdmin) return false;
    const normalized = email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email: normalized } });
    const passwordHash = await hash(password, BCRYPT_ROUNDS);
    await this.users.save(
      existing
        ? { ...existing, role: 'admin' as const, passwordHash }
        : this.users.create({
            email: normalized,
            fullName,
            passwordHash,
            role: 'admin',
          }),
    );
    return true;
  }

  private async session(user: User): Promise<Session> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: toPublicUser(user),
    };
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: PublicUser) {
    return user;
  }
}

/** Seeds the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD. */
@Injectable()
export class AdminBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrap.name);

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account was created',
      );
      return;
    }
    if (password.length < 8) {
      this.logger.warn('ADMIN_PASSWORD must have at least 8 characters');
      return;
    }
    const created = await this.auth.ensureAdmin(
      email,
      password,
      this.config.get<string>('ADMIN_NAME', 'Administrador'),
    );
    if (created) this.logger.log(`Admin account created for ${email}`);
  }
}

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET must be set (at least 32 characters)');
        }
        return { secret, signOptions: { expiresIn: '8h' } };
      },
    }),
    // Login and sign-up: at most AUTH_THROTTLE_LIMIT (10) attempts per minute per client.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { ttl: 60_000, limit: Number(config.get('AUTH_THROTTLE_LIMIT', 10)) },
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminBootstrap],
  exports: [AuthService, AuthGuard, TypeOrmModule],
})
export class AuthModule {}
