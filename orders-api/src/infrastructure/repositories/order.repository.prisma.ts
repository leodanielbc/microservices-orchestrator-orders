import { OrderRepository } from "../../domain/order/gateway/order.repository";
import { Order, OrderStatus } from "../../domain/order/entity/order";
import { OrderItem } from "../../domain/order/entity/order-item";
import { PrismaClient } from "../../generated/prisma/client";

const mapOrderItemToDomain = (prismaItem: any): OrderItem => {
  return OrderItem.with({
    id: prismaItem.id,
    orderId: prismaItem.orderId,
    productId: prismaItem.productId,
    qty: prismaItem.qty,
    unitPriceCents: prismaItem.unitPriceCents,
    subtotalCents: prismaItem.subtotalCents,
  });
};

const mapToDomain = (prismaOrder: any): Order => {
  return Order.with({
    id: prismaOrder.id,
    customerId: prismaOrder.customerId,
    status: prismaOrder.status as OrderStatus,
    totalCents: prismaOrder.totalCents,
    items: prismaOrder.items ? prismaOrder.items.map(mapOrderItemToDomain) : undefined,
    createdAt: prismaOrder.createdAt?.toISOString(),
    updatedAt: prismaOrder.updatedAt?.toISOString(),
  });
};

export class OrderRepositoryPrisma implements OrderRepository {
  private constructor(private readonly prismaClient: PrismaClient) {}

  public static create(prismaClient: PrismaClient) {
    return new OrderRepositoryPrisma(prismaClient);
  }

  public async save(dataOrder: Order): Promise<Order> {
    const orderData = {
      id: dataOrder.id,
      customerId: dataOrder.customerId,
      status: dataOrder.status,
      totalCents: dataOrder.totalCents,
    };

    const itemsData = dataOrder.items?.map(item => ({
      id: item.id,
      productId: item.productId,
      qty: item.qty,
      unitPriceCents: item.unitPriceCents,
      subtotalCents: item.subtotalCents,
    })) || [];

    const created = await this.prismaClient.order.create({
      data: {
        ...orderData,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return mapToDomain(created);
  }

  public async findById(id: string): Promise<Order | null> {
    const orderData = await this.prismaClient.order.findFirst({
      where: { id: id },
      include: {
        items: true,
      },
    });

    return orderData ? mapToDomain(orderData) : null;
  }

  public async search(options: {
    status?: OrderStatus;
    from?: string;
    to?: string;
    cursor?: string;
    limit: number;
  }): Promise<{ orders: Order[], nextCursor: string | null }> {
    const { status, from, to, cursor, limit } = options;

    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        whereClause.createdAt.lte = new Date(to);
      }
    }

    const orders = await this.prismaClient.order.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    const hasNextPage = orders.length > limit;
    const orderList = hasNextPage ? orders.slice(0, limit) : orders;
    const nextCursor = hasNextPage && orderList.length > 0
      ? orderList[orderList.length - 1]!.id
      : null;

    return {
      orders: orderList.map(mapToDomain),
      nextCursor
    };
  }

  public async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const updated = await this.prismaClient.order.update({
      where: { id: id },
      data: { status: status },
      include: {
        items: true,
      },
    });

    return mapToDomain(updated);
  }
}
