import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// user ID validation
const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive number"),
});

export const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = userIdSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }
  next();
};

// update user email validation
const updateUserSchema = z.object({
  email: z.email("Email must be a valid email"),
});

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }

  next();
};
