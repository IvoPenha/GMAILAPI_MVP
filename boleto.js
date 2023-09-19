const { PDFBarcodeJs } = require("pdf-barcode");
const boletoUtils = require("@mrmgomes/boleto-utils");
function decodeBarCodeFromPDF(pdfPath) {
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
  const file_path = new URL(
    `file:///${pdfPath}`
  ).href;

  // const file_path = new URL(
  //   `file:///${__dirname}/boleto_teste.pdf`
  // ).href;


  let boletoValidado = ''
  return new Promise((resolve, reject) => {
    var callback = function (result) {
      if (result.success) {
        const res = result.codes.toString();
        const boletoValidado = validarBoleto(res);
        console.log(boletoValidado)
        resolve(boletoValidado); // Resolva a Promise com o resultado
      } else {
        console.error(result.message);
        reject(result.message); // Rejeite a Promise com uma mensagem de erro
      }
    };

    PDFBarcodeJs.decodeSinglePage(file_path, 1, configs, callback);
  });

  function validarBoleto(boleto) {
    const response = boletoUtils.validarBoleto(boleto, "CODIGO_DE_BARRAS");
    console.log(response)
    return response;
  }
}


module.exports = { decodeBarCodeFromPDF };