import { Boleto } from "./../../domain/types/anexos/boleto";
import { Response, Request } from "express";
import { google } from "googleapis";
import axios from "axios";
// import { admin }  from "../../../app";
const nodemailer = require("nodemailer");
const CONSTANTS = require("../../infra/constants");
import {
  encryptText,
  decryptText,
  decodeBarCodeFromPDF,
  generateConfig,
  generateAndUseTemporaryPDF,
} from "../../core";
import { createAnexo } from "./Attachments";
import {
  BaseRequest,
  BaseRequestQuery,
  BaseResponse,
} from "../../domain/types";
import {  PrismaClient  } from "@prisma/client";
import { getInstitutionalMailName } from "../../core/email";
import { refreshToken } from "firebase-admin/app";
import admin from "../../../app";
import jwt from "jsonwebtoken";
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

const prisma = new PrismaClient();

// async function verificarToken(token) {
//   try {
//     // Verifique o token com o cliente OAuth2
//     const ticket = await oAuth2Client.verifyIdToken({
//       idToken: token,
//       audience: process.env.CLIENT_ID, // O cliente ID do seu aplicativo
//     });

//     const payload = ticket.getPayload();
//     // Aqui, você pode verificar os detalhes do usuário, como o payload.sub, payload.email, etc.
//     console.log(payload)
//     return payload;
//   } catch (error) {
//     console.error('Erro ao verificar o token:', error);
//     throw new Error('Token inválido');
//   }
// }

interface LoginResponse {
  message: string;
  token?: string;
}

async function handleAuthorizationCode(
  req: BaseRequest<{ authorizationCode: string }, {}>,
  res: Response
) {
  try {
    const { authorizationCode } = req.body;
    console.log(authorizationCode);
    const response = await oAuth2Client.getToken(authorizationCode);
    console.log(response);
    res.json({ token: response });
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
}

async function sendMail(req: Request, res: Response) {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        ...CONSTANTS.auth,
        // accessToken: accessToken,
      },
    });

    const mailOptions = {
      ...CONSTANTS.mailoptions,
      text: "The Gmail API with NodeJS works",
    };

    const result = await transport.sendMail(mailOptions);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getUser(req: Request, res: Response) {
  try {
    // await oAuth2Client.setCredentials({
    //   refreshToken: process.env.REFRESH_TOKEN,
    // });
    console.log(process.env.REFRESH_TOKEN);
    const { token } = await oAuth2Client.getAccessToken();
    console.log(token);
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/profile`;
    // const config = generateConfig(url, token);
    // const response = await axios(config);
    // res.json(response.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function readLookingForAttachments(
  email: string,
  messageId: string,
  attachmentId: string,
  token: string
): Promise<(Boleto & { base64: string }) | null> {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${messageId}/attachments/${attachmentId}`;
    const config = generateConfig(url, token);
    const response = await axios(config);
    const decodedBarcode = await generateAndUseTemporaryPDF(
      response.data.data,
      decodeBarCodeFromPDF
    );
    if (decodedBarcode) {
      return { ...decodedBarcode, base64: response.data.data };
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

interface AttachmentReadedFromMessage {
  enviadoPor: string;
  nomeArquivo: string;
  dataEmail: string;
  mensagemId: string;
  assunto: string;
  boleto: Boleto & { base64: string };
}

async function readEachMessageReturningAttachment(
  email: string,
  messageId: string,
  token: string
): Promise<AttachmentReadedFromMessage | null> {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${messageId}`;
    const config = generateConfig(url, token);
    const response = await axios(config);
    const SentBy = response.data.payload.headers.find(
      (header: { name: string }) => header.name === "From"
    ).value;
    const emailDate = response.data.payload.headers.find(
      (header: { name: string }) => header.name === "Date"
    ).value;
    const subject = response.data.payload.headers.find(
      (header: { name: string }) => header.name === "Subject"
    ).value;
    if (response.data.payload.parts[1].body.attachmentId) {
      const boleto = await readLookingForAttachments(
        email,
        messageId,
        response.data.payload.parts[1].body.attachmentId,
        token
      );
      const fileName = response.data.payload.parts[1].filename;
      if (boleto)
        return {
          enviadoPor: SentBy,
          nomeArquivo: fileName,
          dataEmail: emailDate,
          mensagemId: messageId,
          assunto: subject,
          boleto,
        };
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function filterArrayForNullOrEmptyObjects<T>(array: T[]): T[] {
  return array.filter((item) => item !== null && item !== undefined);
}

interface RequestWithQuery extends Request {
  email: any;
  query: {
    after: string;
    before: string;
  };
}

async function getAttachmentFromMessages(
  req: BaseRequest<{ refreshToken: string }, { after: string; before: string }>,
  res: Response
) {
  const BearerToken = req.headers.authorization?.split(" ")[1];
  console.log(req.headers.authorization?.split(" "));

  console.log(BearerToken);
  if (BearerToken == undefined)
    return res.json({ message: "faltou o bearerToken" });
  const decodedToken = jwt.decode(BearerToken, { json: true, complete: true });
  const payload = decodedToken?.payload as { id: number } | undefined;
  console.log("decodedToken>", payload);
  if (!payload)
    return res.json({
      message: "Não foi possivel decodar o token",
    });
  const perfil = await prisma.perfil.findFirst({
    where: {
      usuarioId: +payload.id,
    },
  });

  if (!perfil || perfil.googleRefreshToken == null || undefined)
    res.json({
      message: "nada de token",
    });

  oAuth2Client.setCredentials({ refresh_token: perfil?.googleRefreshToken });
  const afterTimestamp = new Date(req.query.after).getTime() / 1000;
  const beforeTimestamp = new Date(req.query.before).getTime() / 1000;
  let query = "?q=";

  if (afterTimestamp) {
    query += ` after:${afterTimestamp}`;
  }

  if (beforeTimestamp) {
    query += ` before:${beforeTimestamp}`;
  }

  query += " has:attachment filename:pdf";
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages${query}`;
    const { token } = await oAuth2Client.getAccessToken();
    if (!token)
      return res.json({ message: "Não foi encontrado token no oAuthCLient" });
    const config = generateConfig(url, token!);
    const response = await axios(config);
    let data = (await response.data) as { messages: [{ id: string }] };
    const attachments = await Promise.all(
      data.messages.map(async (message) => {
        const hasBeenRead = await prisma.googleReadMessages.findFirst({
          where: {
            messageId: message.id,
          },
        });
        if (hasBeenRead) {
          return null;
        }

        const attachment = await readEachMessageReturningAttachment(
          req.params.email,
          message.id,
          token
        );
        const addedToCacheMessages = await prisma.googleReadMessages.create({
          data: {
            messageId: message.id,
            usuarioId: +payload.id,
          },
        });
        console.log(
          "adicionei ao cache de mensagens lidas:",
          addedToCacheMessages
        );
        if (attachment) {
          return attachment;
        }
      })
    );

    const filteredArray = filterArrayForNullOrEmptyObjects(
      attachments
    ) as AttachmentReadedFromMessage[];

    filteredArray.map((mail) => {
      const remetente = getInstitutionalMailName(mail.enviadoPor);
      if (mail.boleto.sucesso)
        return createAnexo({
          base64: mail.boleto.base64,
          codigoBarras: mail.boleto.linhaDigitavel,
          dataEmail: new Date(mail.dataEmail),
          dataVencimento: new Date(mail.boleto.vencimento),
          assunto: mail.assunto,
          mensagemId: mail.mensagemId,
          nomeArquivo: mail.nomeArquivo,
          valor: mail.boleto.valor,
          enviadoPor: remetente,
          perfilId: 1,
        });
    });
    return res.json(filteredArray);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export {
  sendMail,
  getUser,
  getAttachmentFromMessages,
  handleAuthorizationCode,
};
