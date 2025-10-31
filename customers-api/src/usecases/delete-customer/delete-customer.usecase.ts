import { CustomerRepository } from '../../domain/customer/gateway/customer.repository';

export class DeleteCustomerUseCase {
    constructor(private customerRepository: CustomerRepository) {}

    async execute(id: string): Promise<boolean> {

        const existingCustomer = await this.customerRepository.findById(id);

        if (!existingCustomer) {
            throw new Error('Customer not found.');
        }

        const deleted = await this.customerRepository.softDelete(id);

        if (!deleted) {
            throw new Error('Customer could not be deleted.');
        }

        return true;
    }
}
