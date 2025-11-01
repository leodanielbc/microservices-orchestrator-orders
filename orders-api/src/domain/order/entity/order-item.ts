import { randomUUID } from 'crypto';

type OrderItemProps = {
    id: string;
    orderId?: string;
    productId: string;
    qty: number;
    unitPriceCents: number;
    subtotalCents: number;
}

export class OrderItem {
    private constructor(private props: OrderItemProps) { }

    public static create(productId: string, qty: number, unitPriceCents: number) {
        const subtotalCents = qty * unitPriceCents;

        return new OrderItem({
            id: randomUUID(),
            productId,
            qty,
            unitPriceCents,
            subtotalCents,
        })
    }

    public static with(props: OrderItemProps) {
        return new OrderItem(props);
    }

    public get id(): string {
        return this.props.id;
    }

    public get orderId(): string | undefined {
        return this.props.orderId;
    }

    public get productId(): string {
        return this.props.productId;
    }

    public get qty(): number {
        return this.props.qty;
    }

    public get unitPriceCents(): number {
        return this.props.unitPriceCents;
    }

    public get subtotalCents(): number {
        return this.props.subtotalCents;
    }

    public setOrderId(orderId: string): void {
        this.props.orderId = orderId;
    }

    public toJSON() {
        return {
            id: this.id,
            orderId: this.orderId,
            productId: this.productId,
            qty: this.qty,
            unitPriceCents: this.unitPriceCents,
            subtotalCents: this.subtotalCents,
        };
    }
}
