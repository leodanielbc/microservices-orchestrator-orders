import { Customer } from '../../domain/customer/entity/customer';
import { CustomerRepository } from '../../domain/customer/gateway/customer.repository';

export class GetCustomerUseCase {
    constructor(private customerRepository: CustomerRepository) {}

    async execute(id: string): Promise<Customer | null> {
        const customer = await this.customerRepository.findById(id);

        return customer;
    }
}
