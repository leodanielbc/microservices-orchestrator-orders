import 'dotenv/config';
import { CustomerRepositoryPrisma } from './infrastructure/repositories/customer.repository.prisma';
import { prisma } from './infrastructure/package/prisma';
import { CreateCustomerUseCase } from './usecases/create-customer/create-customer.usecase';
import { GetInternalCustomerUseCase } from './usecases/get-internal-customer/get-internal-customer.usecase';
import { GetCustomerUseCase } from './usecases/get-customer/get-customer.usecase';
import { CreateCustomerRoute } from './infrastructure/api/express/routes/create-customer.router';
import { GetInternalCustomerRoute } from './infrastructure/api/express/routes/get-internal-customer.router';
import { GetCustomerRoute } from './infrastructure/api/express/routes/get-customer.router';
import { ApiExpress } from './infrastructure/api/express/api.express';

function main () {
    const repository = CustomerRepositoryPrisma.create(prisma);

    const createCustomerUsecase = CreateCustomerUseCase.create(repository);
    const getInternalCustomerUsecase = new GetInternalCustomerUseCase(repository);
    const getCustomerUsecase = new GetCustomerUseCase(repository);

    const createRoute = CreateCustomerRoute.create(createCustomerUsecase);
    const getInternalCustomerRoute = GetInternalCustomerRoute.create(getInternalCustomerUsecase);
    const getCustomerRoute = GetCustomerRoute.create(getCustomerUsecase);

    const api = ApiExpress.create([createRoute, getInternalCustomerRoute, getCustomerRoute]);
    const port = 3001;
    api.start(port);

}

main();