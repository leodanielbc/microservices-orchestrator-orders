import { Product } from '../../domain/product/entity/product';
import { ProductRepository } from '../../domain/product/gateway/product.repository';

export class GetProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    public static create(productRepository: ProductRepository) {
        return new GetProductUseCase(productRepository);
    }

    async execute(id: string): Promise<Product | null> {
        const product = await this.productRepository.findById(id);
        return product;
    }
}
