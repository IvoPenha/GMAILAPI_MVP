export function getInstitutionalMailName(email: string) {
  const emailSplitted = email.split("@");
  const domain = emailSplitted[1];
  const domainSplitted = domain.split(".");
  const institutionalName = domainSplitted[0];
  if (
    !(
      institutionalName === "gmail" ||
      institutionalName === "hotmail" ||
      institutionalName === "yahoo" ||
      institutionalName === "outlook"
    )
  )
    return institutionalName;

  const arr = email.split("<");
  const nome = arr[0];
  return nome.length > 1 ? nome : email;
}
