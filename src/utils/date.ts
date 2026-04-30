import { differenceInYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(value: Date | string) {
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function getAge(birthDate: Date | string) {
  return differenceInYears(new Date(), new Date(birthDate));
}
