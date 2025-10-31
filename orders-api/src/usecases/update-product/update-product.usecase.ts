import { Product } from '../../domain/product/entity/product';
import { ProductRepository } from '../../domain/product/gateway/product.repository';
import { ProductUpdateData } from '../../domain/product/value-objects/product-data';

export class UpdateProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    public static create(productRepository: ProductRepository) {
        return new UpdateProductUseCase(productRepository);
    }

    async execute(id: string, data: ProductUpdateData): Promise<Product> {
        const existingProduct = await this.productRepository.findById(id);

        if (!existingProduct) {
            throw new Error('Product not found.');
        }

        if (data.priceCents !== undefined && data.priceCents < 0) {
            throw new Error('Price must be greater than or equal to 0.');
        }

        if (data.stock !== undefined && data.stock < 0) {
            throw new Error('Stock must be greater than or equal to 0.');
        }

        const updatedProduct = await this.productRepository.update(id, data);
        return updatedProduct;
    }
}
