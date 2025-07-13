// Global error handling or u can call standerd errors

import { Request, Response } from "express";
import { AppError } from "./index";

export const errorMiddleware = (err: Error, req: Request, res: Response) => {
  if (err instanceof AppError) {
    console.log(`Error: ${req.method} ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.log("Unhandled Error:", err);
  return res.status(500).json({
    status: 500,
    message: "Something went wrong try after some time",
  });
}