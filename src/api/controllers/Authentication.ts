import { Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { decryptText, encryptText } from '../../core';
import { createProfile } from './Profile';

const jwt = require('jsonwebtoken');

const prisma = new PrismaClient()


interface SignUpRequest {
  nome: string;
  email: string;
  senha: string;
}

interface signUp{
  message: string;
  response: {
    id?: number;
    email?: string;
    senha?: string;
    nome?: string;
    error?: any;
  }
}

export async function signUp(req: {body: SignUpRequest}, res: Response<signUp>) {
  try{
    const { email, senha, nome } = req.body
    const hasUser = await prisma.user.findFirst({
      where: {
            email: email,
      },
    });
    if(hasUser){
      throw new Error("Usuário já cadastrado");
    }

    const encryptedSenha = encryptText(senha)
    const user = await prisma.user.create({
      data: {
        email,
        senha: encryptedSenha,
        nome
      }
    })
    const profile = createProfile({body: {userId: user.id}})
    console.log(profile)
    res.status(200).json({message: 'Login Bem sucedido', response: {email: user.email, senha: user.senha, nome: user.nome as string, id: user.id}})
  } catch (error: any) {
    res.status(500).json({ message: "Ocorreu um erro durante o cadastro", response: {error: error.message} });
  }
} 


interface LoginResponse {
  message: string;
  response: {
    accessToken?: string;
    erro?: unknown;
  }
}

interface LoginRequest {
  email: string;
  senha: string;
}

export async function signIn(
  req: { body: LoginRequest },
  res: Response<LoginResponse>
) {
  try {
    const { email, senha } = req.body;
    console.log(req.body)
    const user = await prisma.user.findFirst({
      where: {
            email: email,
      },
    });
    console.log(user)
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const decryptedSenha = decryptText(user.senha)
    if (decryptedSenha !== senha) {
      throw new Error("Senha incorreta");
    }
    const userDTO = {
      id: user.id,
      email: user.email,
      nome: user.nome,
    };
    jwt.sign({...userDTO, expires_in: new Date().getTime() + 3600000 }, 'secretkey', (err : unknown, token : string) => {
      res
      .status(200)
      .json({ message: "Login bem-sucedido", response: { accessToken: token }});
    })
      
    } catch (error) {
      res.status(500).json({ message: "Ocorreu um erro durante o login", response: {erro: error} });
    }
  
}