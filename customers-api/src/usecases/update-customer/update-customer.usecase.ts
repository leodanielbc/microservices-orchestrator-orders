import { Customer } from '../../domain/customer/entity/customer';
import { CustomerRepository } from '../../domain/customer/gateway/customer.repository';
import { CustomerUpdateData } from '../../domain/customer/value-objects/customer-data';

export interface UpdateCustomerInput {
    id: string;
    data: CustomerUpdateData;
}

export class UpdateCustomerUseCase {
    constructor(private customerRepository: CustomerRepository) {}

    async execute(input: UpdateCustomerInput): Promise<Customer> {
        // Validar que al menos un campo esté presente
        if (!input.data.name && !input.data.email && !input.data.phone) {
            throw new Error('At least one field must be provided for update.');
        }

        // Verificar que el cliente existe
        const existingCustomer = await this.customerRepository.findById(input.id);
        if (!existingCustomer) {
            throw new Error('Customer not found.');
        }

        // Si se está actualizando el email, verificar que no esté en uso por otro cliente
        if (input.data.email && input.data.email !== existingCustomer.email) {
            const customerWithEmail = await this.customerRepository.findByEmail(input.data.email);
            if (customerWithEmail && customerWithEmail.id !== input.id) {
                throw new Error('Email already in use by another customer.');
            }
        }

        // Actualizar el cliente
        const updatedCustomer = await this.customerRepository.update(input.id, input.data);

        return updatedCustomer;
    }
}
