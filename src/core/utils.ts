export const generateConfig = (url: string, accessToken: string) => {
  return {
    method: "get",
    url: url,
    headers: {
      Authorization: `Bearer ${accessToken} `,
      "Content-type": "application/json",
    },
  };
};

const fs = require("fs");
const path = require("path");
const { tmpdir } = require("os");
import { decodeBarCodeFromPDF } from "./boleto";

export async function generateAndUseTemporaryPDF(
  base64Pdf: string,
  callbackFunction: (arg: any) => any
) {
  // Decode the Base64 string into binary data
  const pdfBuffer = Buffer.from(base64Pdf, "base64");

  // Create a temporary file path
  const tempPdfFilePath = path.join(tmpdir(), `temp-pdf-${Date.now()}.pdf`);

  // Write the binary data to the temporary PDF file
  fs.writeFileSync(tempPdfFilePath, pdfBuffer);

  // Now you can use the temporary PDF file as needed within this function
  console.log("Temporary PDF file created:", tempPdfFilePath);
  const callbackedFunctionResult = await decodeBarCodeFromPDF(tempPdfFilePath);
  // console.log(callbackedFunctionResult)
  return callbackedFunctionResult;

  // After using the temporary file, you can delete it
  // fs.unlinkSync(tempPdfFilePath);
  // console.log('Temporary PDF file deleted');
}
