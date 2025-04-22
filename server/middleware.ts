import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export function zodMiddleware<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (result.success) {
        req.body = result.data;
        next();
      } else {
        const error = fromZodError(result.error);
        res.status(400).json({ 
          message: "Validation failed", 
          errors: error.details 
        });
      }
    } catch (error) {
      next(error);
    }
  };
}
