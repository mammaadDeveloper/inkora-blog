import {
  AuthenticationStorage,
  type RefreshTokenRecord,
  type RefreshTokenStore,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaRefreshTokenStore implements RefreshTokenStore {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AuthenticationStorage,
  ) {
    this.storage.registerSource({ refreshTokens: this });
  }

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const record = await this.prisma.refreshToken.findUnique({ where: { id } });

    if (!record) {
      return undefined;
    }

    return {
      id: record.id,
      familyId: record.familyId,
      userId: record.userId,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      familyExpiresAt: record.familyExpiresAt,
      usedAt: record.usedAt ?? undefined,
      claims: (record.claims as Record<string, unknown> | null) ?? undefined,
    };
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.prisma.refreshToken.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        familyId: record.familyId,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        familyExpiresAt: record.familyExpiresAt,
        usedAt: record.usedAt ?? null,
        familyRevokedAt: null,
        claims: this.toJson(record.claims),
      },
      update: {
        familyId: record.familyId,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        familyExpiresAt: record.familyExpiresAt,
        usedAt: record.usedAt ?? null,
        claims: this.toJson(record.claims),
      },
    });
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id,
        usedAt: null,
      },
      data: {
        usedAt: at,
      },
    });

    return result.count > 0;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: {
        familyRevokedAt: new Date(),
      },
    });
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        familyId,
        familyRevokedAt: { not: null },
      },
      select: { id: true },
    });

    return Boolean(record);
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: {
        familyRevokedAt: new Date(),
      },
    });
  }

  private toJson(value: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
    return value as Prisma.InputJsonValue | undefined;
  }
}
