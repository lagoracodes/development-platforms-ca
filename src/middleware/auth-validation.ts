import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// defining validation rules
export const registerSchema = z.object({
  email: z.email("Must be a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.email("Must be a valid email address"),
  password: z.string(),
});

// registration validation middleware
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }

  next();
};

// login validation middleware
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }

  next();
};

// JWT authentication middleware
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  // check if the authorization header even exists
  if (!authHeader) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  // check if the header follows Bearer format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token must be Bearer format",
    });
  }

  const token = authHeader.substring(7);

  // verify the token
  const payload = verifyToken(token);

  // check if the token is valid
  if (!payload) {
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }

  next();
};
