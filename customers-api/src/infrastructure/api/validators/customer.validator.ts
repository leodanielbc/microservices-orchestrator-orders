
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { CreateCustomerInput } from '../../../usecases/create-customer/create-customer.usecase';


const createCustomerSchema = Joi.object<CreateCustomerInput>({
    name: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().max(20).required()
});

const customerIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});


export const validateCreateCustomer = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = createCustomerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            details: error.details.map(d => d.message)
        });
    }
    req.body = value;
    next();
};

export const validateCustomerId = (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = customerIdSchema.validate(req.params, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: 'Invalid customer ID',
            details: error.details.map(d => d.message)
        });
    }
    req.params = value;
    next();
};