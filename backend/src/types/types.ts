import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    name?: string;
  };
}
