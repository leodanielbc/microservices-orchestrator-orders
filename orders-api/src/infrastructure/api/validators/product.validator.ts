import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const createProductSchema = Joi.object({
    sku: Joi.string().trim().min(1).max(50).required(),
    name: Joi.string().trim().min(1).max(200).required(),
    priceCents: Joi.number().integer().min(0).required(),
    stock: Joi.number().integer().min(0).required()
});

const productIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});

const updateProductSchema = Joi.object({
    priceCents: Joi.number().integer().min(0).optional(),
    stock: Joi.number().integer().min(0).optional()
}).min(1);

const searchProductsQuerySchema = Joi.object({
    search: Joi.string().trim().min(1).max(100).optional(),
    cursor: Joi.string().uuid().optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
});

export const validateCreateProduct = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = createProductSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            details: error.details.map(d => d.message)
        });
    }
    req.body = value;
    next();
};

export const validateProductId = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = productIdSchema.validate(req.params, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Invalid product ID',
            details: error.details.map(d => d.message)
        });
    }
    req.params = value;
    next();
};

export const validateUpdateProduct = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = updateProductSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            details: error.details.map(d => d.message)
        });
    }
    req.body = value;
    next();
};

export const validateSearchProductsQuery = (req: Request, res: Response, next: NextFunction): any => {
    const { error } = searchProductsQuerySchema.validate(req.query, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Invalid query parameters',
            details: error.details.map(d => d.message)
        });
    }
    next();
};
