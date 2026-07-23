import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message?: string) => {
  res.json({
    success: true,
    data,
    message,
  });
};

export const sendError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({
    success: false,
    error: { message },
  });
};
