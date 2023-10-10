import { Anexo, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { BaseRequestParams, BaseResponse } from "../../domain/types";

const prisma = new PrismaClient();

interface AttachmentRequest {
  sentBy: string;
  fileName: string;
  emailDate: Date;
  messageId: string;
  subject: string;
  boleto: {
    codigoBarras: string;
    valor?: number | null;
    base64: string;
    vencimento: Date;
  };
  profileId: number;
}

export async function getAttachmentByMessageID(mensagemId: string) {
  try {
    const attachment = await prisma.anexo.findFirst({
      where: {
        mensagemId,
      },
    });
    if (!attachment) return null;
    return attachment;
  } catch (error: any) {
    return error;
  }
}

export async function createAnexo(req: Omit<Anexo, "id">) {
  try {
    const { perfilId, mensagemId } = req;
    console.log('entrei em createAnexo, req:', req)
    if (perfilId === undefined || isNaN(+perfilId))
      throw new Error("ID de usuário inválido");

    const profile = await prisma.perfil.findUnique({
      where: {
        id: perfilId,
      },
    });

    if (!profile) throw new Error("Usuário não encontrado");

    console.log('cheguei até aqui')

    const attachment = await prisma.anexo.create({
      data: {
        ...req,
      },
    });

    console.log('passei no prisma',attachment)

    return attachment;
  } catch (error: any) {
    console.error(error);
    return null;
  }
}

export async function getAttachmentsByProfile(
  req: BaseRequestParams<{ perfilId: string }>,
  res: Response
) {
  try {
    const { perfilId } = req.params;
    if (!perfilId || isNaN(+perfilId)) {
      return res.status(400).json({
        message: "ID de usuário inválido",
        response: { attachments: [] },
      });
    }
    const attachments = await prisma.anexo.findMany({
      where: {
        perfilId: +perfilId,
      },
    });
    return res
      .status(200)
      .json({ message: "Anexos encontrados", response: { attachments } });
  } catch (error: any) {
    return res.status(500).json({
      message: "Ocorreu um erro ao buscar os anexos",
      response: { error: error.message },
    });
  }
}
