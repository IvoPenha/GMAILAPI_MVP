import { Response } from "express";
import { PrismaClient, Usuario } from "@prisma/client";
import { decryptText, encryptText } from "../../core";
// import { createProfileWithoutResponse } from "./Profile";
import { BaseRequest } from "../../domain/types";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface signUp {
  message: string;
  response: {
    id?: number;
    email?: string;
    senha?: string;
    nome?: string;
    error?: any;
  };
}

export async function signUp(req: BaseRequest<Usuario>, res: Response) {
  try {
    const { nome, email, senha, nascimento, telefone } = req.body;
    const hasUsuario = await prisma.usuario.findFirst({
      where: {
        email: email,
      },
    });
    if (hasUsuario) {
      throw new Error("Usuário já cadastrado");
    }

    const encryptedSenha = encryptText(senha);
    const Usuario = await prisma.usuario.create({
      data: {
        email,
        senha: encryptedSenha,
        nome,
      },
    });

    const perfil = await prisma.perfil.create({
      data: {
        usuarioId: Usuario.id,
      },
    });

    res.status(200).json({
      message: "Cadastro Bem sucedido",
      response: {
        email: Usuario.email,
        nome: Usuario.nome as string,
        id: Usuario.id,
        perfil: perfil,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Ocorreu um erro durante o cadastro",
      response: { error: error.message },
    });
  }
}

interface LoginResponse {
  message: string;
  response: {
    accessToken?: string;
    erro?: unknown;
  };
}

interface LoginRequest {
  email: string;
  senha: string;
}

export async function signIn(req: { body: LoginRequest }, res: Response) {
  try {
    const { email, senha } = req.body;
    console.log(req.body);
    const Usuario = await prisma.usuario.findFirst({
      where: {
        email: email,
      },
    });
    console.log(Usuario);
    if (!Usuario) {
      throw new Error("Usuário não encontrado");
    }
    const decryptedSenha = decryptText(Usuario.senha);
    if (decryptedSenha !== senha) {
      throw new Error("Senha incorreta");
    }
    const UsuarioDTO = {
      id: Usuario.id,
      email: Usuario.email,
      nome: Usuario.nome,
    };
    const token = jwt.sign(
      {
        expires_in: Math.floor(Date.now() / 1000) + 60 * 60,
        ...UsuarioDTO,
      },
      "secretkey"
    );

    const perfil = await prisma.perfil.findFirst({
      where: {
        usuarioId: Usuario.id,
      },
      include: {
        Anexos: true,
      },
    });

    console.info("meu perfil:", perfil);
    res.status(200).json({
      message: "Login realizado com sucesso",
      response: { accessToken: token },
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocorreu um erro durante o login",
      response: { erro: error },
    });
  }
}
