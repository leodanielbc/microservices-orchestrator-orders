import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '../../../domain/order/entity/order';

const createOrderItemSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    qty: Joi.number().integer().min(1).required()
});

const createOrderSchema = Joi.object({
    customer_id: Joi.string().uuid().required(),
    items: Joi.array().items(createOrderItemSchema).min(1).required()
});

const orderIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});

const searchOrdersQuerySchema = Joi.object({
    status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    cursor: Joi.string().uuid().optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
});

const idempotencyKeyHeaderSchema = Joi.object({
    'x-idempotency-key': Joi.string().trim().min(1).max(255).required()
}).unknown(true); // Permitir otros headers HTTP (user-agent, authorization, etc.)

export const validateCreateOrder = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            details: error.details.map(d => d.message)
        });
    }
    req.body = value;
    next();
};

export const validateOrderId = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = orderIdSchema.validate(req.params, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Invalid order ID',
            details: error.details.map(d => d.message)
        });
    }
    req.params = value;
    next();
};

export const validateSearchOrdersQuery = (req: Request, res: Response, next: NextFunction): any => {
    const { error } = searchOrdersQuerySchema.validate(req.query, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Invalid query parameters',
            details: error.details.map(d => d.message)
        });
    }
    next();
};

export const validateIdempotencyKey = (req: Request, res: Response, next: NextFunction): any => {
    const { error } = idempotencyKeyHeaderSchema.validate(req.headers, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Missing or invalid X-Idempotency-Key header',
            details: error.details.map(d => d.message)
        });
    }
    next();
};
