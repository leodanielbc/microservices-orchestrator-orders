import { Order, OrderStatus } from '../../domain/order/entity/order';
import { OrderRepository } from '../../domain/order/gateway/order.repository';
import { ProductRepository } from '../../domain/product/gateway/product.repository';
import { PrismaClient } from '@prisma/client';

export class CancelOrderUseCase {
    constructor(
        private orderRepository: OrderRepository,
        private productRepository: ProductRepository,
        private prismaClient: PrismaClient
    ) {}

    public static create(
        orderRepository: OrderRepository,
        productRepository: ProductRepository,
        prismaClient: PrismaClient
    ) {
        return new CancelOrderUseCase(orderRepository, productRepository, prismaClient);
    }

    async execute(orderId: string): Promise<Order> {
        return await this.prismaClient.$transaction(async (tx) => {
            const order = await this.orderRepository.findById(orderId);

            if (!order) {
                throw new Error('Order not found.');
            }

            // Validar que puede ser cancelada
            if (!order.canBeCanceled()) {
                if (order.status === OrderStatus.CANCELED) {
                    throw new Error('Order is already canceled.');
                }
                if (order.status === OrderStatus.CONFIRMED) {
                    throw new Error('Cannot cancel confirmed order after 10 minutes.');
                }
            }

            // Restaurar stock
            if (order.items) {
                for (const item of order.items) {
                    await this.productRepository.incrementStock(item.productId, item.qty);
                }
            }


            order.cancel();
            const canceledOrder = await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELED);

            return canceledOrder;
        });
    }
}
