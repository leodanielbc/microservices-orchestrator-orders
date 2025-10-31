import axios from 'axios';

export type CustomerData = {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export class CustomersApiService {
    private baseUrl: string;
    private serviceToken: string;

    constructor(baseUrl: string, serviceToken: string) {
        this.baseUrl = baseUrl;
        this.serviceToken = serviceToken;
    }

    public static create(baseUrl: string, serviceToken: string) {
        return new CustomersApiService(baseUrl, serviceToken);
    }

    async validateCustomer(customerId: string): Promise<CustomerData | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/internal/customers/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${this.serviceToken}`,
                },
            });

            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error(`Failed to validate customer: ${error.message}`);
        }
    }
}
