import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import type { PublicUser, UserRole } from '../users/user.entity';

export interface JwtPayload {
  sub: number;
  role: UserRole;
}

export type AuthenticatedRequest = Request & { user?: PublicUser };

const ROLES_KEY = 'roles';

/** Restricts a controller or handler to the given roles (used with AuthGuard). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** The user resolved by AuthGuard for the current request. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PublicUser => {
    const user = ctx.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) throw new UnauthorizedException('Inicia sesión para continuar');
    return user;
  },
);

/**
 * Verifies the bearer token and reloads the user from the database, so a
 * deleted account or a changed role takes effect before the token expires.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Inicia sesión para continuar');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'Tu sesión expiró. Vuelve a iniciar sesión',
      );
    }

    const user = await this.users.findOne({
      where: { id: Number(payload.sub) },
    });
    if (!user) {
      throw new UnauthorizedException(
        'Tu sesión expiró. Vuelve a iniciar sesión',
      );
    }
    request.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException('No tienes permiso para esta sección');
    }
    return true;
  }
}
