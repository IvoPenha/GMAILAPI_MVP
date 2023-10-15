
import { PrismaClient, Situacao } from '@prisma/client';
import { Request, Response } from "express";

const prisma = new PrismaClient();

interface FiltrosBoletos {
  perfilId: number;
  dataInicio?: string;
  dataFim?: string;
  situacao?: string;
}

export const readBoletosByProfileId = async (req: Request, res: Response) => {
  const { perfilId } = req.params;
  const { dataInicio, dataFim, situacao } = req.query;
  if (!perfilId) return res.status(400).json({ error: "ID inválido" });

  const filtros: FiltrosBoletos = {
    perfilId: +perfilId,
  };

  if (dataInicio && dataFim) {
    filtros.dataInicio = dataInicio as string;
    filtros.dataFim = dataFim as string;
  }

  if (situacao) {
    filtros.situacao = situacao as string;
  }

  try {
    const boletos = await prisma.anexo.findMany({
      where: filtros,
      orderBy: {
        dataVencimento: 'asc'
      }
    });
    return res.status(200).json(boletos);
  }
  catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const patchBoletoSituacao = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { situacao } = req.body;
  if (!id) return res.status(400).json({ error: "ID inválido" });
  if (!situacao) return res.status(400).json({ error: "Situação inválida" });
  if (!Object.values(Situacao).includes(situacao as Situacao)) return res.status(400).json({ error: "Situação inválida" });

  try {
    const boleto = await prisma.anexo.update({
      where: {
        id: +id
      },
      data: {
        Situacao: situacao
      }
    });
    return res.status(200).json({ message: 'sucesso ao alterar a situação', response: boleto });
  }
  catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}