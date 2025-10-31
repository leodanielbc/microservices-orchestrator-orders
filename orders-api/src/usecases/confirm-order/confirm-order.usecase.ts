import { Order, OrderStatus } from '../../domain/order/entity/order';
import { OrderRepository } from '../../domain/order/gateway/order.repository';
import { IdempotencyRepository } from '../../domain/order/gateway/idempotency.repository';

export class ConfirmOrderUseCase {
    constructor(
        private orderRepository: OrderRepository,
        private idempotencyRepository: IdempotencyRepository
    ) {}

    public static create(
        orderRepository: OrderRepository,
        idempotencyRepository: IdempotencyRepository
    ) {
        return new ConfirmOrderUseCase(orderRepository, idempotencyRepository);
    }

    async execute(orderId: string, idempotencyKey: string): Promise<Order> {
        const existingKey = await this.idempotencyRepository.findByKey(idempotencyKey);

        if (existingKey) {
            const order = await this.orderRepository.findById(orderId);
            if (!order) {
                throw new Error('Order not found.');
            }
            return order;
        }

        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found.');
        }

        if (order.status !== OrderStatus.CREATED) {
            throw new Error(`Cannot confirm order with status ${order.status}. Only CREATED orders can be confirmed.`);
        }

        order.confirm();
        const confirmedOrder = await this.orderRepository.updateStatus(orderId, OrderStatus.CONFIRMED);

        // Expire idempotency key in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.idempotencyRepository.save({
            key: idempotencyKey,
            targetType: 'order_confirmation',
            targetId: orderId,
            status: 'completed',
            responseBody: JSON.stringify(confirmedOrder),
            expiresAt: expiresAt,
        });

        return confirmedOrder;
    }
}
