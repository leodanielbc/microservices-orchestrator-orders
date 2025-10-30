import { Customer } from '../entity/customer';
import { CustomerUpdateData } from '../value-objects/customer-data';

export interface CustomerRepository {
    save(data: Customer): Promise<Customer>;
    findById(id: string): Promise<Customer | null>;
    findByEmail(email: string): Promise<Customer | null>;
    search(options: { search?: string, cursor?: number, limit: number }): Promise<Customer[]>;
    update(id: string, data: CustomerUpdateData): Promise<Customer>;
    softDelete(id: string): Promise<boolean>;
}