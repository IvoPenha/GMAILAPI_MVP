import { Attachment, PrismaClient, Profile } from "@prisma/client";
import { Response } from "express";

const prisma = new PrismaClient();

interface ProfileRequest {
  googleRefreshToken?: string;
  microsoftRefreshToken?: string;
  userId: number;
}

interface ProfileResponse {
  message: string;
  response: {
    id?: number;
    googleRefreshToken?: string | null;
    microsoftRefreshToken?: string | null;
    userId?: number | null;
    error?: any;
    Attachments?: Attachment[];
  };
}

export async function createProfile(req: { body: ProfileRequest }) {
  try {
    const { userId } = req.body;
    const profile = await prisma.profile.create({
      data: {
        userId,
      },
    });
    return profile;
  } catch (error: any) {
    return error;
  }
}

export async function getProfileByUser(
  req: { params: { userId: number } },
  res: Response<ProfileResponse>
) {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res
        .status(400)
        .json({ message: "ID de usuário inválido", response: {} });
    }

    const profile = await prisma.profile.findFirst({
      where: {
        userId: +userId,
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Perfil não encontrado", response: {} });
    }

    res
      .status(200)
      .json({
        message: "Perfil encontrado",
        response: {
          id: profile.id,
          googleRefreshToken: profile.googleRefreshToken,
          microsoftRefreshToken: profile.microsoftRefreshToken,
          userId,
        },
      });
  } catch (error: any) {
    console.error("Erro durante a busca:", error);
    res
      .status(500)
      .json({
        message: "Ocorreu um erro durante a busca",
        response: { error: error.message },
      });
  }
}
