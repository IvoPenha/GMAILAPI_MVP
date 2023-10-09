import jwt from "jsonwebtoken";
import { BaseRequest, BaseResponse } from "../../domain/";
import { NextFunction, Request, Response } from "express";

export async function verificarToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Token não informado" });
  }
  const token = authorization.split(" ")[1];

  jwt.verify(token, "secretkey", (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido", error: err });
    }
    next();
  });
}
