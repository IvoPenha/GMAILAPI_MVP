import crypto from "crypto-js";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ??
  "VhrTg97KtVqlmYdEecgYEP+C76O/Go/6heZPdjKAw8gWm/x1LPaj0SFe+07rXeEc"; // Certifique-se de definir essa variável no seu arquivo .env

export function encryptText(text: string) {
  const encryptedText = crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return encryptedText;
}

export function decryptText(encryptedText: string) {
  const bytes = crypto.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  const decryptedText = bytes.toString(crypto.enc.Utf8);
  return decryptedText;
}
