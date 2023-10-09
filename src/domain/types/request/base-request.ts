import { Request as ExpressRequest } from "express";

export type BaseRequest<T, Y = {}> = ExpressRequest & {
  body: T;
  query?: Y;
  params?: Y;
};

export type BaseRequestParams<T> = ExpressRequest & {
  params: T;
};

export type BaseRequestQuery<T> = ExpressRequest & {
  query: T;
};
