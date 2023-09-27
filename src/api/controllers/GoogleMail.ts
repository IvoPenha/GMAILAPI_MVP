import { Response, Request } from "express";
const axios = require("axios");
// import { admin }  from "../../../app";
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const CONSTANTS = require("../../infra/constants");
import {
  encryptText,
  decryptText,
  decodeBarCodeFromPDF,
  generateConfig,
  generateAndUseTemporaryPDF,
} from"../../core";
import { createAttachment } from './Attachments';

require("dotenv").config();


const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

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

async function login(
  req: { body: { accessToken: string } },
  res: Response<LoginResponse>
) {
  try {
    // oAuth2Client.setCredentials({ refresh_token: req.refreshToken });
    // verificarToken(req.body.refreshToken);
    const accessToken = req.body.accessToken;
    console.log('accessToken', accessToken)
    const encryptedAccessToken = encryptText(accessToken);
    res
      .status(200)
      .json({ message: "Login bem-sucedido", token: encryptedAccessToken });
  } catch (error) {
    console.error("Erro durante o login:", error);
    res.status(500).json({ message: "Ocorreu um erro durante o login" });
  }
}

async function sendMail(req: Request, res: Response<any>) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        ...CONSTANTS.auth,
        accessToken: accessToken,
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

async function getUser(req: Request, res: Response<any>) {
  try {
    if(req.headers.authorization === undefined) {
      throw new Error('Token não informado')
    }
    const accessToken = decryptText(req.headers.authorization);
    oAuth2Client.setCredentials({ access_token: accessToken });
    console.log(accessToken);
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/profile`;
    const config = generateConfig(url, accessToken);
    const response = await axios(config);
    res.json(response.data);
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
) {
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
    return error;
  }
}

interface AttachmentReadedFromMessage {
  SentBy: string;
  fileName: string;
  emailDate: string;
  messageId: string;
  subject: string;
  attachment: {
    barcode: string;
    dueDate: string;
    amount: string;
    base64: string;
  };
}

async function readEachMessageReturningAttachment(
  email: string,
  messageId: string,
  token: string
): Promise<AttachmentReadedFromMessage | any> {
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

      return {
        SentBy,
        fileName,
        emailDate,
        messageId,
        subject,
        boleto,
      };
    }
    return null;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function filterArrayForNullOrEmptyObjects(array: any[]) {
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
  req: RequestWithQuery,
  res: Response<any>
) {
  if(req.headers.authorization === undefined) {
    throw new Error('Token não informado')
  }
  const accessToken = decryptText(req.headers.authorization);
  oAuth2Client.setCredentials({ access_token: accessToken });
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
    // const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, accessToken);
    const response = await axios(config);
    let data = (await response.data) as { messages: [{ id: string }] };
    const attachments = await Promise.all(
      data.messages.map(async (message) => {
        const attachment = await readEachMessageReturningAttachment(
          req.params.email,
          message.id,
          accessToken
        );
        if (attachment.messageId) {
          return attachment;
        }
      })
    );

    const filteredArray = filterArrayForNullOrEmptyObjects(attachments);
    filteredArray.map(
      mail => {
        if(mail.boleto.sucesso){
          createAttachment({
            boleto: mail.boleto,
            emailDate: mail.emailDate,
            fileName: mail.fileName,
            messageId: mail.messageId,
            sentBy: mail.SentBy,
            subject: mail.subject,
            profileId: 1
          })
        }
      }
    )
  
    res.json(filteredArray);
    res.json({});
  } catch (error) {
    console.log(error);
    return error;
  }
  res.json({});
}

export { sendMail, getUser, getAttachmentFromMessages, login };
