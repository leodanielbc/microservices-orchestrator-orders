import { IdempotencyRepository, IdempotencyKeyData } from "../../domain/order/gateway/idempotency.repository";
import { PrismaClient } from "@prisma/client";

const mapToDomain = (prismaKey: any): IdempotencyKeyData => {
  return {
    key: prismaKey.key,
    targetType: prismaKey.targetType,
    targetId: prismaKey.targetId,
    status: prismaKey.status,
    responseBody: prismaKey.responseBody,
    expiresAt: prismaKey.expiresAt,
  };
};

export class IdempotencyRepositoryPrisma implements IdempotencyRepository {
  private constructor(private readonly prismaClient: PrismaClient) {}

  public static create(prismaClient: PrismaClient) {
    return new IdempotencyRepositoryPrisma(prismaClient);
  }

  public async save(data: IdempotencyKeyData): Promise<void> {
    await this.prismaClient.idempotencyKey.create({
      data: {
        key: data.key,
        targetType: data.targetType,
        targetId: data.targetId,
        status: data.status,
        ...(data.responseBody && { responseBody: data.responseBody }),
        expiresAt: data.expiresAt,
      },
    });
  }

  public async findByKey(key: string): Promise<IdempotencyKeyData | null> {
    const keyData = await this.prismaClient.idempotencyKey.findUnique({
      where: { key: key },
    });

    if (!keyData) {
      return null;
    }

    // Check if expired
    if (keyData.expiresAt < new Date()) {
      return null;
    }

    return mapToDomain(keyData);
  }
}
