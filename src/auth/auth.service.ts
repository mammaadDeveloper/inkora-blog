import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthTokens, AuthUser, RegisterInput, SignInInput, UserRole } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(input: RegisterInput): Promise<AuthTokens> {
    const email = input.email.trim().toLowerCase();

    if (!email || !input.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('A user with that email already exists.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.USER,
      },
    });

    const issued = await this.tokenService.issue(user.id, {
      claims: { email: user.email, role: user.role },
    });

    return this.toAuthTokens(issued, user);
  }

  async signIn(input: SignInInput): Promise<AuthTokens> {
    const email = input.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const validPassword = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const issued = await this.tokenService.issue(user.id, {
      claims: { email: user.email, role: user.role },
    });

    return this.toAuthTokens(issued, user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const pair = await this.tokenService.refresh(refreshToken);
    return this.toAuthTokens(pair);
  }

  async signOut(refreshToken: string): Promise<boolean> {
    return this.tokenService.revoke(refreshToken);
  }

  async me(user: AuthUser): Promise<AuthUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!existingUser) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role as UserRole,
    };
  }

  private async toAuthTokens(
    issued: { accessToken: string; refreshToken?: string },
    user?: { id: string; email: string; role: string },
  ): Promise<AuthTokens> {
    const payload = this.decodeJwt(issued.accessToken);
    const resolvedUser =
      user ??
      (payload.sub
        ? await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true },
          })
        : null);

    if (!resolvedUser) {
      throw new UnauthorizedException('Unable to resolve authenticated user.');
    }

    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken ?? '',
      user: {
        id: resolvedUser.id,
        email: resolvedUser.email,
        role: resolvedUser.role as UserRole,
      },
    };
  }

  private decodeJwt(token: string): { sub?: string } {
    const [, payloadSegment] = token.split('.');

    if (!payloadSegment) {
      return {};
    }

    const normalized = payloadSegment
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );

    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      sub?: string;
    };
  }
}
