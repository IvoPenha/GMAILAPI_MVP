import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const readBoletosByProfileId = async (req: Request, res: Response) => {
  const { perfilId } = req.params;
  if (!perfilId) return res.status(400).json({ error: "ID inválido" });
  const boletos = await prisma.anexo.findMany({
    where: {
      perfilId: +perfilId,
    },
  });
  return res.status(200).json(boletos);
};
