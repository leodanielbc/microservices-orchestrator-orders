import { Product } from '../../domain/product/entity/product';
import { ProductRepository } from '../../domain/product/gateway/product.repository';

export type CreateProductInput = {
    sku: string;
    name: string;
    priceCents: number;
    stock: number;
}

export class CreateProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    public static create(productRepository: ProductRepository) {
        return new CreateProductUseCase(productRepository);
    }

    async execute(data: CreateProductInput): Promise<Product> {
        const existingProduct = await this.productRepository.findBySku(data.sku);

        if (existingProduct) {
            throw new Error('Product with this SKU already exists.');
        }

        if (data.priceCents < 0) {
            throw new Error('Price must be greater than or equal to 0.');
        }

        if (data.stock < 0) {
            throw new Error('Stock must be greater than or equal to 0.');
        }

        const product = Product.create(data.sku, data.name, data.priceCents, data.stock);
        const newProduct = await this.productRepository.save(product);
        return newProduct;
    }
}
