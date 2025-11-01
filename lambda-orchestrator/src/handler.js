const axios = require('axios');

exports.orchestrateOrder = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const customersApiUrl = process.env.CUSTOMERS_API_URL;
    const ordersApiUrl = process.env.ORDERS_API_URL;
    const serviceToken = process.env.SERVICE_TOKEN;

    const requestId = context.requestId || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


    if (!customersApiUrl || !ordersApiUrl || !serviceToken) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Server configuration error',
                error: 'Missing required environment variables'
            })
        };
    }

    try {
        
        let body;
        try {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        } catch (parseError) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Invalid JSON in request body',
                    error: parseError.message
                })
            };
        }

        const { customer_id, items, idempotency_key } = body;

        if (!customer_id) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Validation error',
                    errors: ['customer_id is required']
                })
            };
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Validation error',
                    errors: ['items must be a non-empty array']
                })
            };
        }

    
        if (!idempotency_key || typeof idempotency_key !== 'string' || idempotency_key.trim().length === 0) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Validation error',
                    errors: ['idempotency_key is required and must be a non-empty string']
                })
            };
        }

        // Step 1: Validate customer exists
        console.log(`Step 1: Validating customer ${customer_id}...`);
        let customer;
        try {
            const customerResponse = await axios.get(
                `${customersApiUrl}/internal/customers/${customer_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceToken}`
                    }
                }
            );
            customer = customerResponse.data;
            console.log('Customer validated:', customer);
        } catch (error) {
            if (error.response?.status === 404) {
                return {
                    statusCode: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Customer not found',
                        error: `Customer with id ${customer_id} does not exist`
                    })
                };
            }
            throw error;
        }

        // Step 2: Create order (with idempotency)
        console.log('Step 2: Creating order...');

        // Use the idempotency_key for order creation
        const orderIdempotencyKey = `create-order-${idempotency_key}`;
        console.log(`Using idempotency key for order creation: ${orderIdempotencyKey}`);

        let order;
        try {
            const createOrderResponse = await axios.post(
                `${ordersApiUrl}/orders`,
                {
                    customer_id,
                    items
                },
                {
                    headers: {
                        'Authorization': `Bearer ${serviceToken}`,
                        'X-Idempotency-Key': orderIdempotencyKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            order = createOrderResponse.data;
            console.log('Order created:', order);
        } catch (error) {
            if (error.response?.status === 400) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Failed to create order',
                        error: error.response.data.message || 'Invalid order data'
                    })
                };
            }
            throw error;
        }

        // Step 3: Confirm order (with idempotency)
        console.log(`Step 3: Confirming order ${order.id}...`);

        // Use a different idempotency key for order confirmation
        const confirmIdempotencyKey = `confirm-order-${idempotency_key}`;
        console.log(`Using idempotency key for order confirmation: ${confirmIdempotencyKey}`);
        let confirmedOrder;
        try {
            const confirmOrderResponse = await axios.post(
                `${ordersApiUrl}/orders/${order.id}/confirm`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${serviceToken}`,
                        'X-Idempotency-Key': confirmIdempotencyKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            confirmedOrder = confirmOrderResponse.data;
            console.log('Order confirmed:', confirmedOrder);
        } catch (error) {
            if (error.response?.status === 400) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Failed to confirm order',
                        error: error.response.data.message || 'Cannot confirm order'
                    })
                };
            }
            throw error;
        }

        // Step 4: Return success response
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Order orchestrated successfully',
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email
                },
                order: confirmedOrder
            })
        };

    } catch (error) {
        console.error('Orchestration error:', error);

        // Handle axios errors
        if (error.response) {
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            return {
                statusCode: error.response.status || 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Orchestration failed',
                    error: error.response.data?.message || error.message,
                    details: error.response.data
                })
            };
        }

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Internal orchestration error',
                error: error.message
            })
        };
    }
};
