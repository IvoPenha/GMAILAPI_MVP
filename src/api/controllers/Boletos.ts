
import { PrismaClient, Situacao, } from '@prisma/client';
import { Request, Response } from "express";
import { getFirstAndLastDayOfYearMonths } from '../../core';

const prisma = new PrismaClient();

interface FiltrosBoletos {
  perfilId: number;
  date?: {
    gte?: string;
    lte?: string;
  }
  situacao?: Situacao;
}

export const readBoletosByProfileId = async (req: Request, res: Response) => {
  const { perfilId } = req.params;
  const { month, situacao } = req.query;
  if (!perfilId) return res.status(400).json({ error: "ID inválido" });

  const filtros: FiltrosBoletos = {
    perfilId: +perfilId,
  };


  if (month) {
    const data = new Date(month as string);
    const datas = getFirstAndLastDayOfYearMonths(data.getMonth() + 2);
    if (datas) {
      const { dataInicio, dataFim } = datas;
      const formattedDataInicio = new Date(dataInicio as string).toISOString();
      const formattedDataFim = new Date(dataFim as string).toISOString();
      console.log(formattedDataInicio, formattedDataFim)
      filtros.date = {
        gte: formattedDataInicio,
        lte: formattedDataFim
      }
    }
  }

  if (situacao) {
    filtros.situacao = situacao as Situacao;
  }

  try {
    const boletos = await prisma.anexo.findMany({
      where: {
        perfilId: filtros.perfilId,
        dataVencimento: filtros.date,
        situacao: filtros.situacao
      },
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
        situacao: situacao
      }
    });
    return res.status(200).json({ message: 'sucesso ao alterar a situação', response: boleto });
  }
  catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}