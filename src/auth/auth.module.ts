import {
  AuthenticationModule,
  PasswordHasher,
  TokenService,
} from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthorizationModule } from '@nestjs/authorization';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtAuthProvider } from './jwt-auth.provider.js';
import { PrismaRefreshTokenStore } from './prisma-refresh-token-store.js';
import { AuthResolver } from './auth.resolver.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthenticationModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accessToken: {
          key: configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
          issuer: configService.get<string>('JWT_ISSUER') ?? 'inkora',
          audience: configService.get<string>('JWT_AUDIENCE') ?? 'inkora-api',
          ttl: '15m',
        },
        refreshToken: {
          ttl: '7d',
          absoluteTtl: '30d',
        },
        password: {
          logN: 12,
        },
        allowInMemoryStorage: false,
      }),
    }),
    AuthorizationModule.forRoot(),
  ],
  providers: [AuthService, JwtAuthProvider, PrismaRefreshTokenStore, TokenService, PasswordHasher, AuthResolver],
  exports: [AuthService, JwtAuthProvider, PrismaRefreshTokenStore],
})
export class AuthModule {}
