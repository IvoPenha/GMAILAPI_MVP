import { Boleto } from "../domain/types";

const { PDFBarcodeJs } = require("pdf-barcode");
const boletoUtils = require("@mrmgomes/boleto-utils");

export function decodeBarCodeFromPDF(pdfPath: string): Promise<Boleto> {
  var configs = {
    scale: {
      once: true,
      value: 3,
      start: 3,
      step: 0.6,
      stop: 4.8,
    },
    resultOpts: {
      singleCodeInPage: true,
      multiCodesInPage: false,
      maxCodesInPage: 1,
    },
    patches: ["x-small", "small", "medium"],
    improve: true,
    noisify: true,
    quagga: {
      inputStream: {},
      locator: {
        halfSample: false,
      },
      decoder: {
        readers: ["i2of5_reader"],
        multiple: true,
      },
      locate: true,
    },
  };

  const file_path = new URL(`file:///${pdfPath}`).href;

  // const file_path = new URL(
  //   `file:///${__dirname}/boleto_teste.pdf`
  // ).href;

  return new Promise((resolve, reject) => {
    var callback = function (result: any) {
      if (result.success) {
        const res = result.codes.toString();
        const boletoValidado = validarBoleto(res);
        resolve(boletoValidado); // Resolva a Promise com o resultado
      } else {
        reject(result.message); // Rejeite a Promise com uma mensagem de erro
      }
    };

    PDFBarcodeJs.decodeSinglePage(file_path, 1, configs, callback);
  });

  function validarBoleto(boleto: string) {
    const response = boletoUtils.validarBoleto(boleto, "CODIGO_DE_BARRAS");
    return response;
  }
}
