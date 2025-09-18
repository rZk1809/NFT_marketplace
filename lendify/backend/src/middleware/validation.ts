import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  // Ethereum address validation
  ethereumAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  
  // MongoDB ObjectId validation
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  
  // MongoDB ID validation (alias for objectId)
  mongoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),
  
  // Chain ID validation
  chainId: Joi.number().valid(1, 137, 42161, 10, 8453).required(),
  
  // Token ID validation
  tokenId: Joi.string().required(),
  
  // Price validation (in ETH)
  price: Joi.string().pattern(/^\d+\.?\d*$/).required(),
  
  // Duration validation (in days)
  duration: Joi.number().integer().min(1).max(365).required()
};