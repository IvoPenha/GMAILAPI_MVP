import { Response as ExpressResponse } from "express";

interface ErrorResponse {
  message: string;
  error: string;
}

export type BaseResponse<T> = ExpressResponse & {
  body: T | ErrorResponse;
};
