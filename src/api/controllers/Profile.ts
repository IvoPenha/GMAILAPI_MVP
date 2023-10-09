import { PrismaClient, Anexo, Perfil } from "@prisma/client";
import { Response } from "express";
import { BaseRequest, BaseResponse } from "../../domain/types";

const prisma = new PrismaClient();

interface ProfileRequest {
  googleRefreshToken?: string;
  microsoftRefreshToken?: string;
  usuarioId: number;
}

interface ProfileResponse {
  id?: number;
  googleRefreshToken?: string | null;
  microsoftRefreshToken?: string | null;
  usuarioId?: number | null;
  error?: any;
  anexos: Anexo[];
}

export async function createProfile(req: ProfileRequest) {
  try {
    const { usuarioId } = req;
    const profile = await prisma.perfil.create({
      data: {
        usuarioId,
      },
    });
    return profile;
  } catch (error: any) {
    return error;
  }
}

export async function getProfileByUser(
  req: BaseRequest<ProfileRequest>,
  res: Response
) {
  try {
    const { usuarioId } = req.params;

    if (!usuarioId || isNaN(+usuarioId)) {
      return res
        .status(400)
        .json({ message: "ID de usuário inválido", response: {} });
    }

    const profile = await prisma.perfil.findFirst({
      where: {
        usuarioId: +usuarioId,
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Perfil não encontrado", response: {} });
    }

    res.status(200).json({
      message: "Perfil encontrado",
      response: {
        id: profile.id,
        googleRefreshToken: profile.googleRefreshToken,
        microsoftRefreshToken: profile.microsoftRefreshToken,
        usuarioId,
      },
    });
  } catch (error: any) {
    console.error("Erro durante a busca:", error);
    res.status(500).json({
      message: "Ocorreu um erro durante a busca",
      response: { error: error.message },
    });
  }
}

export async function updateProfile(
  req: BaseRequest<ProfileRequest, {usuarioId: number}>,
  res: Response
) {
  try {
    const { usuarioId } = req.params;
    const { googleRefreshToken, microsoftRefreshToken } = req.body;

    if (!usuarioId || isNaN(+usuarioId)) {
      return res
        .status(400)
        .json({ message: "ID de usuário inválido", response: {} });
    }

    const profile = await prisma.perfil.update({
      where: {
        usuarioId: +usuarioId,
      },
      data: {
        googleRefreshToken,
        microsoftRefreshToken,
      },
    });

    res.status(200).json({
      message: "Perfil atualizado",
      response: {
        id: profile.id,
        googleRefreshToken: profile.googleRefreshToken,
        microsoftRefreshToken: profile.microsoftRefreshToken,
        usuarioId,
      },
    });
  } catch (error: any) {
    console.error("Erro durante a atualização:", error);
    res.status(500).json({
      message: "Ocorreu um erro durante a atualização",
      response: { error: error.message },
    });
  }
}