const axios = require("axios");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const { generateConfig, generateAndUseTemporaryPDF } = require("./utils");
const CONSTANTS = require("./constants");

const { decodeBarCodeFromPDF } = require('./boleto');
require("dotenv").config();

const crypto = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Certifique-se de definir essa variável no seu arquivo .env

function encryptToken(text) {
  const encryptedText = crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return encryptedText;
}

function decryptToken(encryptedText) {
  const bytes = crypto.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  const decryptedText = bytes.toString(crypto.enc.Utf8);
  return decryptedText;
}



const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri:  process.env.REDIRECT_URI,
  eagerRefreshThresholdMillis: '300000'
}
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function login(req, res) {
  try {
    // oAuth2Client.setCredentials({ refresh_token: req.refreshToken });
    const refreshToken = req.body.refreshToken;
    const encryptedRefreshToken = encryptToken(refreshToken);
    res.status(200).json({ message: 'Login bem-sucedido', token: encryptedRefreshToken });
  } catch (error) {
    console.error('Erro durante o login:', error);
    res.status(500).json({ message: 'Ocorreu um erro durante o login' });
  }
}
  
async function sendMail(req, res) {
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

async function getUser(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/ivoxps@gmail.com/profile`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getDrafts(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/drafts`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function readLookingForAttachments(email, messageId, attachmentId, token) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${messageId}/attachments/${attachmentId}`;
    const config = generateConfig(url, token);
    const response = await axios(config);
    const decodedBarcode = await generateAndUseTemporaryPDF(response.data.data, decodeBarCodeFromPDF);
    if(decodedBarcode){
      return {...decodedBarcode, base64: response.data.data}
    } else {
      return null
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function readEachMessageReturningAttachment(email, messageId, token) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${messageId}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    const SentBy = response.data.payload.headers.find(
      (header) => header.name === "From"
    ).value;
    const emailDate = response.data.payload.headers.find(
      (header) => header.name === "Date"
    ).value;
    const subject = response.data.payload.headers.find(
      (header) => header.name === "Subject"
    ).value;
    if (response.data.payload.parts[1].body.attachmentId) {
      const attachment = await readLookingForAttachments(
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
        attachment,
      };
    }
    return null;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function filterArrayForNullOrEmptyObjects(array) {
  return array.filter((item) => item !== null && item !== undefined);
}

async function getAttachmentFromMessages(req, res) {
  if (!req.headers.token) {
    return res.status(401).json({ message: 'Token não encontrado no cabeçalho' });
  }
  const refreshToken = decryptToken(req.headers.token);
  // oAuth2Client.setCredentials({ refresh_token: refreshToken })
  // console.log(await oAuth2Client.getAccessToken())
  const afterTimestamp = new Date(req.query.after).getTime()/1000;
  const beforeTimestamp = new Date(req.query.before).getTime()/1000;
  let query = "?q=";

  if (afterTimestamp) {
    query += ` after:${afterTimestamp}`;
  }

  if (beforeTimestamp) {
    query += ` before:${beforeTimestamp}`;
  }

  query += " has:attachment";
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages${query}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    let data = await response.data;
    const attachments = await Promise.all(
      data.messages.map(async (message) => {
        const attachment = await readEachMessageReturningAttachment(
          req.params.email,
          message.id,
          token
        );
        if (attachment.messageId) {
          return attachment;
        }
      })
    );

    const filteredArray = filterArrayForNullOrEmptyObjects(attachments)
    res.json(filteredArray);
    res.json({})
  } catch (error) {
    console.log(error);
    return error;
  }
  res.json({})
}

async function readMail(req, res) {
  try {
    const url = `https://gmail.googleapis.com//gmail/v1/users/sid.cd.varma@gmail.com/messages/${req.params.messageId}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);

    let data = await response.data;

    res.json(data);
  } catch (error) {
    res.send(error);
  }
}

module.exports = {
  getUser,
  sendMail,
  getDrafts,
  readMail,
  getAttachmentFromMessages,
  login
};
