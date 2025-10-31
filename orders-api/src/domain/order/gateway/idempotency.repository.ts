export type IdempotencyKeyData = {
    key: string;
    targetType: string;
    targetId: string;
    status: string;
    responseBody?: string;
    expiresAt: Date;
}

export interface IdempotencyRepository {
    save(data: IdempotencyKeyData): Promise<void>;
    findByKey(key: string): Promise<IdempotencyKeyData | null>;
}
