import { Order } from '../../domain/order/entity/order';
import { OrderItem } from '../../domain/order/entity/order-item';
import { OrderRepository } from '../../domain/order/gateway/order.repository';
import { ProductRepository } from '../../domain/product/gateway/product.repository';
import { CustomersApiService } from '../../infrastructure/services/customers-api.service';
import { PrismaClient } from '../../generated/prisma/client';

export type CreateOrderItemInput = {
    product_id: string;
    qty: number;
}

export type CreateOrderInput = {
    customer_id: string;
    items: CreateOrderItemInput[];
}

export class CreateOrderUseCase {
    constructor(
        private orderRepository: OrderRepository,
        private productRepository: ProductRepository,
        private customersApiService: CustomersApiService,
        private prismaClient: PrismaClient
    ) {}

    public static create(
        orderRepository: OrderRepository,
        productRepository: ProductRepository,
        customersApiService: CustomersApiService,
        prismaClient: PrismaClient
    ) {
        return new CreateOrderUseCase(orderRepository, productRepository, customersApiService, prismaClient);
    }

    async execute(data: CreateOrderInput): Promise<Order> {
        // Validar que el cliente existe en Customers API
        const customer = await this.customersApiService.validateCustomer(data.customer_id);
        if (!customer) {
            throw new Error(`Customer with id ${data.customer_id} not found.`);
        }

        if (!data.items || data.items.length === 0) {
            throw new Error('Order must have at least one item.');
        }

        // Usar transacción para asegurar consistencia
        return await this.prismaClient.$transaction(async (tx) => {
            const orderItems: OrderItem[] = [];

            // Validar stock y crear items
            for (const itemInput of data.items) {
                const product = await this.productRepository.findById(itemInput.product_id);

                if (!product) {
                    throw new Error(`Product with id ${itemInput.product_id} not found.`);
                }

                if (!product.hasStock(itemInput.qty)) {
                    throw new Error(
                        `Insufficient stock for product ${product.name} (SKU: ${product.sku}). ` +
                        `Available: ${product.stock}, Requested: ${itemInput.qty}`
                    );
                }

                // Descontar stock
                await this.productRepository.decrementStock(product.id, itemInput.qty);

                // Crear OrderItem
                const orderItem = OrderItem.create(
                    product.id,
                    itemInput.qty,
                    product.priceCents
                );
                orderItems.push(orderItem);
            }

            // Crear orden
            const order = Order.create(data.customer_id, orderItems);
            const createdOrder = await this.orderRepository.save(order);

            return createdOrder;
        });
    }
}
