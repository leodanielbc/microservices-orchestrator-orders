import { Product } from '../../domain/product/entity/product';
import { ProductRepository } from '../../domain/product/gateway/product.repository';

export type SearchProductsInput = {
    search?: string;
    cursor?: string;
    limit?: number;
}

export class SearchProductsUseCase {
    constructor(private productRepository: ProductRepository) {}

    public static create(productRepository: ProductRepository) {
        return new SearchProductsUseCase(productRepository);
    }

    async execute(input: SearchProductsInput): Promise<{ products: Product[], nextCursor: string | null }> {
        const limit = input.limit ?? 10;

        const result = await this.productRepository.search({
            ...(input.search && { search: input.search }),
            ...(input.cursor && { cursor: input.cursor }),
            limit: limit,
        });

        return result;
    }
}
