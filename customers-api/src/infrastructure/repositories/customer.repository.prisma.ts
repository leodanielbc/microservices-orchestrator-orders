import { CustomerRepository } from "../../domain/customer/gateway/customer.repository";
import { Customer } from "../../domain/customer/entity/customer";
import {
  CustomerUpdateData,
} from "../../domain/customer/value-objects/customer-data";
import { PrismaClient } from "../../generated/prisma/client";

const mapToDomain = (prismaCustomer: any): Customer => {
  return Customer.with({
    id: prismaCustomer.id,
    name: prismaCustomer.name,
    email: prismaCustomer.email,
    phone: prismaCustomer.phone || "",
    isDeleted: prismaCustomer.isDeleted,
    createdAt: prismaCustomer.createdAt?.toISOString(),
    updatedAt: prismaCustomer.updatedAt?.toISOString(),
  });
};

export class CustomerRepositoryPrisma implements CustomerRepository {
  private constructor(private readonly prismaClient: PrismaClient) {}

  public static create(prismaClient: PrismaClient) {
    return new CustomerRepositoryPrisma(prismaClient);
  }

  public async save(dataCustomer: Customer): Promise<Customer> {
    try {
      const data = {
        id: dataCustomer.id,
        name: dataCustomer.name,
        email: dataCustomer.email,
        phone: dataCustomer.phone,
      };
      const created = await this.prismaClient.customer.create({data});
      return mapToDomain(created);

    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target.includes("email")) {
        throw new Error("Customer with this email already exists.");
      }
      throw error;
    }
  }

  public async findById(id: string): Promise<Customer | null> {
    const customerData = await this.prismaClient.customer.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    return customerData ? mapToDomain(customerData) : null;
  }

  public async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prismaClient.customer.findFirst({
      where: {
        email: email,
        isDeleted: false,
      },
    });

    return customer ? mapToDomain(customer) : null;
  }

  public async update(id: string, data: CustomerUpdateData): Promise<Customer> {
    try {
      const existing = await this.prismaClient.customer.findFirst({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      if (!existing) {
        throw new Error("Customer not found for update.");
      }

      const updatedCustomer = await this.prismaClient.customer.update({
        where: {
          id: id,
        },
        data: data,
      });
      return mapToDomain(updatedCustomer);
    } catch (error: any) {
      
      if (error.code === "P2025") {
        throw new Error("Customer not found for update.");
      }

      if (error.code === "P2002" && error.meta?.target.includes("email")) {
        throw new Error(
          "Update failed: Email already registered by another customer."
        );
      }
      throw error;
    }
  }

  public async search(options: {
    search?: string;
    cursor?: number;
    limit: number;
  }): Promise<Customer[]> {
    const { search, cursor, limit } = options;

    const whereClause = {
      isDeleted: false,
      ...(search && {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      }),
    };

    const customers = await this.prismaClient.customer.findMany({
      where: whereClause,
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor.toString() } }),
      orderBy: { createdAt: "asc" },
    });

    return customers.map(mapToDomain);
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.prismaClient.customer.updateMany({
      where: { id: id, isDeleted: false },
      data: { isDeleted: true },
    });

    return result.count > 0;
  }
}
