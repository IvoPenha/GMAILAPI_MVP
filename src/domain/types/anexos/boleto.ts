export interface Boleto {
  sucesso: boolean;
  codigoInput: string;
  mensagem: string;
  tipoCodigoInput: string;
  tipoBoleto: string;
  codigoBarras: string;
  linhaDigitavel: string;
  vencimento: string;
  valor: number;
  base64: string;
}
