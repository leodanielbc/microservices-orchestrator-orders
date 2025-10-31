import { Customer } from '../../domain/customer/entity/customer';
import { CustomerRepository } from '../../domain/customer/gateway/customer.repository';

export interface SearchCustomersInput {
    search?: string;
    cursor?: string;
    limit?: number;
}

export interface SearchCustomersOutput {
    customers: Customer[];
    nextCursor: string | null;
    hasMore: boolean;
}

export class SearchCustomersUseCase {
    private readonly DEFAULT_LIMIT = 10;
    private readonly MAX_LIMIT = 100;

    constructor(private customerRepository: CustomerRepository) {}

    async execute(input: SearchCustomersInput): Promise<SearchCustomersOutput> {
        const limit = Math.min(input.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);

        const searchOptions: { search?: string; cursor?: string; limit: number } = {
            limit
        };

        if (input.search) {
            searchOptions.search = input.search;
        }

        if (input.cursor) {
            searchOptions.cursor = input.cursor;
        }

        const result = await this.customerRepository.search(searchOptions);

        return {
            customers: result.customers,
            nextCursor: result.nextCursor,
            hasMore: result.nextCursor !== null
        };
    }
}
