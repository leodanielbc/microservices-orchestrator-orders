import { Product } from '../entity/product';
import { ProductUpdateData } from '../value-objects/product-data';

export interface ProductRepository {
    save(data: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    search(options: { search?: string, cursor?: string, limit: number }): Promise<{ products: Product[], nextCursor: string | null }>;
    update(id: string, data: ProductUpdateData): Promise<Product>;
    decrementStock(productId: string, quantity: number): Promise<void>;
    incrementStock(productId: string, quantity: number): Promise<void>;
}
