import { Order, OrderStatus } from '../../domain/order/entity/order';
import { OrderRepository } from '../../domain/order/gateway/order.repository';

export type SearchOrdersInput = {
    status?: OrderStatus;
    from?: string;
    to?: string;
    cursor?: string;
    limit?: number;
}

export class SearchOrdersUseCase {
    constructor(private orderRepository: OrderRepository) {}

    public static create(orderRepository: OrderRepository) {
        return new SearchOrdersUseCase(orderRepository);
    }

    async execute(input: SearchOrdersInput): Promise<{ orders: Order[], nextCursor: string | null }> {
        const limit = input.limit ?? 10;

        const result = await this.orderRepository.search({
            ...(input.status && { status: input.status }),
            ...(input.from && { from: input.from }),
            ...(input.to && { to: input.to }),
            ...(input.cursor && { cursor: input.cursor }),
            limit: limit,
        });

        return result;
    }
}
