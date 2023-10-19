export function getFirstAndLastDayOfYearMonths(
  month: number
): { dataInicio: string; dataFim: string } | null {
  // Validação do mês (deve estar entre 1 e 12)
  if (month === 13)
    month = 1;

  if (month < 1 || month > 12) {
    console.error("Mês inválido. Forneça um mês entre 1 e 12.");
    return null;
  }

  // Obtém o ano atual
  const currentYear = new Date().getFullYear();

  // Calcula o primeiro dia do mês anterior
  const dataInicio = new Date(
    currentYear,
    month - 1,
    1
  ).toLocaleDateString("en-Us");

  // Calcula o último dia do mês seguinte
  const dataFim = new Date(currentYear, month, 0).toLocaleDateString("en-Us")

  return {
    dataInicio,
    dataFim,
  };
}
export function getDateToYYYYMM(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth()}`
    }`;
}

export function getMonthfromYYYYMMstring(dateValue: string) {
  const date = new Date(dateValue);
  console.log(date, date.getMonth())
  return date.getMonth() + 2;
}

export function getFirstDayFromPreviousMonthAndLastDayOfTheMonthByNumber(
  month: number
): { dataInicio: string; dataFim: string } | null {
  // Validação do mês (deve estar entre 1 e 12)
  if (month < 1 || month > 12) {
    console.error("Mês inválido. Forneça um mês entre 1 e 12.");
    return null;
  }

  // Obtém o ano atual
  const currentYear = new Date().getFullYear();

  // Calcula o primeiro dia do mês anterior
  const dataInicio = new Date(
    currentYear,
    month - 2,
    1
  ).toLocaleDateString("en-Us");

  // Calcula o último dia do mês seguinte
  const dataFim = new Date(currentYear, month - 1, 0).toLocaleDateString("en-Us")

  return {
    dataInicio,
    dataFim,
  };
}
