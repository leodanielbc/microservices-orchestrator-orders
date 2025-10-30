import { Customer } from '../../domain/customer/entity/customer';
import { CustomerRepository } from '../../domain/customer/gateway/customer.repository';

export type CreateCustomerInput = {
    name: string;
    email: string;
    phone: string;
}

export class CreateCustomerUseCase {
    constructor(private customerRepository: CustomerRepository) {}

    public static create(customerRepository: CustomerRepository) {
        return new CreateCustomerUseCase(customerRepository);
    }

    async execute(data: CreateCustomerInput): Promise<Customer> {
        const existingCustomer = await this.customerRepository.findByEmail(data.email);

        if (existingCustomer) {
            throw new Error('Customer with this email already exists.');
        }

        const customer = Customer.create(data.name, data.email, data.phone);
        const newCustomer = await this.customerRepository.save(customer);
        return newCustomer;
    }
}