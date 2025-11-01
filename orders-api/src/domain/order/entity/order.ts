import { randomUUID } from 'crypto';
import { OrderItem } from './order-item';

export enum OrderStatus {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    CANCELED = 'CANCELED'
}

type OrderProps = {
    id: string;
    customerId: string;
    status: OrderStatus;
    totalCents: number;
    items?: OrderItem[];
    createdAt?: string;
    updatedAt?: string;
}

export class Order {
    private constructor(private props: OrderProps) { }

    public static create(customerId: string, items: OrderItem[]) {
        const totalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);

        return new Order({
            id: randomUUID(),
            customerId,
            status: OrderStatus.CREATED,
            totalCents,
            items,
        })
    }

    public static with(props: OrderProps) {
        return new Order(props);
    }

    public get id(): string {
        return this.props.id;
    }

    public get customerId(): string {
        return this.props.customerId;
    }

    public get status(): OrderStatus {
        return this.props.status;
    }

    public get totalCents(): number {
        return this.props.totalCents;
    }

    public get items(): OrderItem[] | undefined {
        return this.props.items;
    }

    public get createdAt(): string | undefined {
        return this.props.createdAt;
    }

    public get updatedAt(): string | undefined {
        return this.props.updatedAt;
    }

    public confirm(): void {
        if (this.props.status !== OrderStatus.CREATED) {
            throw new Error(`Cannot confirm order with status ${this.props.status}`);
        }
        this.props.status = OrderStatus.CONFIRMED;
    }

    public cancel(): void {
        if (this.props.status === OrderStatus.CANCELED) {
            throw new Error('Order is already canceled');
        }

        // Validar regla de 10 minutos para órdenes confirmadas
        if (this.props.status === OrderStatus.CONFIRMED && this.props.updatedAt) {
            const updatedAt = new Date(this.props.updatedAt);
            const now = new Date();
            const diffInMinutes = (now.getTime() - updatedAt.getTime()) / 1000 / 60;

            if (diffInMinutes > 10) {
                throw new Error('Cannot cancel confirmed order after 10 minutes');
            }
        }

        this.props.status = OrderStatus.CANCELED;
    }

    public canBeCanceled(): boolean {
        if (this.props.status === OrderStatus.CANCELED) {
            return false;
        }

        if (this.props.status === OrderStatus.CONFIRMED && this.props.updatedAt) {
            const updatedAt = new Date(this.props.updatedAt);
            const now = new Date();
            const diffInMinutes = (now.getTime() - updatedAt.getTime()) / 1000 / 60;
            return diffInMinutes <= 10;
        }

        return true;
    }

    public toJSON() {
        return {
            id: this.id,
            customerId: this.customerId,
            status: this.status,
            totalCents: this.totalCents,
            items: this.items?.map(item => item.toJSON()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
