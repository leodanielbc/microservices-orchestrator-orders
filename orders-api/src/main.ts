import 'dotenv/config';
import { prisma } from './infrastructure/package/prisma';
import { ProductRepositoryPrisma } from './infrastructure/repositories/product.repository.prisma';
import { OrderRepositoryPrisma } from './infrastructure/repositories/order.repository.prisma';
import { IdempotencyRepositoryPrisma } from './infrastructure/repositories/idempotency.repository.prisma';
import { CustomersApiService } from './infrastructure/services/customers-api.service';

// Product Use Cases
import { CreateProductUseCase } from './usecases/create-product/create-product.usecase';
import { GetProductUseCase } from './usecases/get-product/get-product.usecase';
import { UpdateProductUseCase } from './usecases/update-product/update-product.usecase';
import { SearchProductsUseCase } from './usecases/search-products/search-products.usecase';

// Order Use Cases
import { CreateOrderUseCase } from './usecases/create-order/create-order.usecase';
import { GetOrderUseCase } from './usecases/get-order/get-order.usecase';
import { SearchOrdersUseCase } from './usecases/search-orders/search-orders.usecase';
import { ConfirmOrderUseCase } from './usecases/confirm-order/confirm-order.usecase';
import { CancelOrderUseCase } from './usecases/cancel-order/cancel-order.usecase';

// Product Routes
import { CreateProductRoute } from './infrastructure/api/express/routes/create-product.router';
import { GetProductRoute } from './infrastructure/api/express/routes/get-product.router';
import { UpdateProductRoute } from './infrastructure/api/express/routes/update-product.router';
import { SearchProductsRoute } from './infrastructure/api/express/routes/search-products.router';

// Order Routes
import { CreateOrderRoute } from './infrastructure/api/express/routes/create-order.router';
import { GetOrderRoute } from './infrastructure/api/express/routes/get-order.router';
import { SearchOrdersRoute } from './infrastructure/api/express/routes/search-orders.router';
import { ConfirmOrderRoute } from './infrastructure/api/express/routes/confirm-order.router';
import { CancelOrderRoute } from './infrastructure/api/express/routes/cancel-order.router';

import { ApiExpress } from './infrastructure/api/express/api.express';
import { HealthCheckRoute } from './infrastructure/api/express/routes/health.router';

function main() {
    // Repositories
    const productRepository = ProductRepositoryPrisma.create(prisma);
    const orderRepository = OrderRepositoryPrisma.create(prisma);
    const idempotencyRepository = IdempotencyRepositoryPrisma.create(prisma);

    // External Services
    const customersApiUrl = process.env.CUSTOMERS_API_URL || 'http://localhost:3001';
    const serviceToken = process.env.SERVICE_TOKEN || '';
    const customersApiService = CustomersApiService.create(customersApiUrl, serviceToken);

    // Product Use Cases
    const createProductUsecase = CreateProductUseCase.create(productRepository);
    const getProductUsecase = GetProductUseCase.create(productRepository);
    const updateProductUsecase = UpdateProductUseCase.create(productRepository);
    const searchProductsUsecase = SearchProductsUseCase.create(productRepository);

    // Order Use Cases
    const createOrderUsecase = CreateOrderUseCase.create(
        orderRepository,
        productRepository,
        customersApiService,
        prisma
    );
    const getOrderUsecase = GetOrderUseCase.create(orderRepository);
    const searchOrdersUsecase = SearchOrdersUseCase.create(orderRepository);
    const confirmOrderUsecase = ConfirmOrderUseCase.create(orderRepository, idempotencyRepository);
    const cancelOrderUsecase = CancelOrderUseCase.create(orderRepository, productRepository, prisma);

    // Product Routes
    const createProductRoute = CreateProductRoute.create(createProductUsecase);
    const getProductRoute = GetProductRoute.create(getProductUsecase);
    const updateProductRoute = UpdateProductRoute.create(updateProductUsecase);
    const searchProductsRoute = SearchProductsRoute.create(searchProductsUsecase);

    // Order Routes
    const createOrderRoute = CreateOrderRoute.create(createOrderUsecase);
    const getOrderRoute = GetOrderRoute.create(getOrderUsecase);
    const searchOrdersRoute = SearchOrdersRoute.create(searchOrdersUsecase);
    const confirmOrderRoute = ConfirmOrderRoute.create(confirmOrderUsecase);
    const cancelOrderRoute = CancelOrderRoute.create(cancelOrderUsecase);
    const healthCheckRoute = HealthCheckRoute.create();

    const api = ApiExpress.create([
        healthCheckRoute,

        // Products
        searchProductsRoute,
        createProductRoute,
        getProductRoute,
        updateProductRoute,

        // Orders
        searchOrdersRoute,
        createOrderRoute,
        getOrderRoute,
        confirmOrderRoute,
        cancelOrderRoute,
    ]);

    const port = 3002;
    api.start(port);
}

main();
