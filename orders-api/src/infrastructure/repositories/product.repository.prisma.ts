import { ProductRepository } from "../../domain/product/gateway/product.repository";
import { Product } from "../../domain/product/entity/product";
import { ProductUpdateData } from "../../domain/product/value-objects/product-data";
import { PrismaClient } from "../../generated/prisma/client";

const mapToDomain = (prismaProduct: any): Product => {
  return Product.with({
    id: prismaProduct.id,
    sku: prismaProduct.sku,
    name: prismaProduct.name,
    priceCents: prismaProduct.priceCents,
    stock: prismaProduct.stock,
    createdAt: prismaProduct.createdAt?.toISOString(),
    updatedAt: prismaProduct.updatedAt?.toISOString(),
  });
};

export class ProductRepositoryPrisma implements ProductRepository {
  private constructor(private readonly prismaClient: PrismaClient) {}

  public static create(prismaClient: PrismaClient) {
    return new ProductRepositoryPrisma(prismaClient);
  }

  public async save(dataProduct: Product): Promise<Product> {
    try {
      const data = {
        id: dataProduct.id,
        sku: dataProduct.sku,
        name: dataProduct.name,
        priceCents: dataProduct.priceCents,
        stock: dataProduct.stock,
      };
      const created = await this.prismaClient.product.create({ data });
      return mapToDomain(created);

    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target.includes("sku")) {
        throw new Error("Product with this SKU already exists.");
      }
      throw error;
    }
  }

  public async findById(id: string): Promise<Product | null> {
    const productData = await this.prismaClient.product.findFirst({
      where: { id: id },
    });

    return productData ? mapToDomain(productData) : null;
  }

  public async findBySku(sku: string): Promise<Product | null> {
    const product = await this.prismaClient.product.findFirst({
      where: { sku: sku },
    });

    return product ? mapToDomain(product) : null;
  }

  public async update(id: string, data: ProductUpdateData): Promise<Product> {
    try {
      const existing = await this.prismaClient.product.findFirst({
        where: { id: id },
      });

      if (!existing) {
        throw new Error("Product not found for update.");
      }

      const updatedProduct = await this.prismaClient.product.update({
        where: { id: id },
        data: data,
      });
      return mapToDomain(updatedProduct);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error("Product not found for update.");
      }

      if (error.code === "P2002" && error.meta?.target.includes("sku")) {
        throw new Error("Update failed: SKU already registered by another product.");
      }
      throw error;
    }
  }

  public async search(options: {
    search?: string;
    cursor?: string;
    limit: number;
  }): Promise<{ products: Product[], nextCursor: string | null }> {
    const { search, cursor, limit } = options;

    const whereClause = {
      ...(search && {
        OR: [{ name: { contains: search } }, { sku: { contains: search } }],
      }),
    };

    const products = await this.prismaClient.product.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: "asc" },
    });

    const hasNextPage = products.length > limit;
    const productList = hasNextPage ? products.slice(0, limit) : products;
    const nextCursor = hasNextPage && productList.length > 0
      ? productList[productList.length - 1]!.id
      : null;

    return {
      products: productList.map(mapToDomain),
      nextCursor
    };
  }

  public async decrementStock(productId: string, quantity: number): Promise<void> {
    const product = await this.prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${quantity}`);
    }

    await this.prismaClient.product.update({
      where: { id: productId },
      data: { stock: product.stock - quantity },
    });
  }

  public async incrementStock(productId: string, quantity: number): Promise<void> {
    await this.prismaClient.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  }
}
