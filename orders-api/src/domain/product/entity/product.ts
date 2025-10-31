type ProductProps = {
    id: string;
    sku: string;
    name: string;
    priceCents: number;
    stock: number;
    createdAt?: string;
    updatedAt?: string;
}

export class Product {
    private constructor(private props: ProductProps) { }

    public static create(sku: string, name: string, priceCents: number, stock: number) {
        return new Product({
            id: crypto.randomUUID().toString(),
            sku,
            name,
            priceCents,
            stock,
        })
    }

    public static with(props: ProductProps) {
        return new Product(props);
    }

    public get id(): string {
        return this.props.id;
    }

    public get sku(): string {
        return this.props.sku;
    }

    public get name(): string {
        return this.props.name;
    }

    public get priceCents(): number {
        return this.props.priceCents;
    }

    public get stock(): number {
        return this.props.stock;
    }

    public get createdAt(): string | undefined {
        return this.props.createdAt;
    }

    public get updatedAt(): string | undefined {
        return this.props.updatedAt;
    }

    public hasStock(quantity: number): boolean {
        return this.props.stock >= quantity;
    }
}
