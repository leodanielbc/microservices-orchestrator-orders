import { Order } from '../../domain/order/entity/order';
import { OrderRepository } from '../../domain/order/gateway/order.repository';

export class GetOrderUseCase {
    constructor(private orderRepository: OrderRepository) {}

    public static create(orderRepository: OrderRepository) {
        return new GetOrderUseCase(orderRepository);
    }

    async execute(id: string): Promise<Order | null> {
        const order = await this.orderRepository.findById(id);
        return order;
    }
}
