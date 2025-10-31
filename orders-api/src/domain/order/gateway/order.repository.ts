import { Order } from '../entity/order';
import { OrderStatus } from '../entity/order';

export interface OrderRepository {
    save(data: Order): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    search(options: {
        status?: OrderStatus,
        from?: string,
        to?: string,
        cursor?: string,
        limit: number
    }): Promise<{ orders: Order[], nextCursor: string | null }>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
