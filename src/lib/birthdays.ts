import dayjs from "dayjs";

type DateInput = string | null | undefined;

function parseBirthDate(birthDate: DateInput) {
  if (!birthDate) return null;
  const parsed = dayjs(String(birthDate).slice(0, 10));
  return parsed.isValid() ? parsed : null;
}

// Mismo criterio que el backend: los nacidos el 29 de febrero cumplen el 28 en años no bisiestos.
export function isBirthdayToday(birthDate: DateInput, today = dayjs()): boolean {
  const date = parseBirthDate(birthDate);
  if (!date) return false;

  const isLeapYear = today.year() % 4 === 0 && (today.year() % 100 !== 0 || today.year() % 400 === 0);
  if (date.month() === 1 && date.date() === 29 && !isLeapYear) {
    return today.month() === 1 && today.date() === 28;
  }

  return date.month() === today.month() && date.date() === today.date();
}

// Días que se muestra el aviso de cumpleaños antes de la fecha en la lista de clientes.
export const BIRTHDAY_NOTICE_DAYS = 4;

// Días que faltan para el próximo cumpleaños (0 = hoy), o null si no hay fecha de nacimiento.
export function daysUntilBirthday(birthDate: DateInput, today = dayjs()): number | null {
  const date = parseBirthDate(birthDate);
  if (!date) return null;

  const start = today.startOf("day");
  for (const year of [start.year(), start.year() + 1]) {
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const day = date.month() === 1 && date.date() === 29 && !isLeapYear ? 28 : date.date();
    const next = dayjs(new Date(year, date.month(), day));
    if (!next.isBefore(start)) return next.diff(start, "day");
  }
  return null;
}

export function birthdayNoticeLabel(birthDate: DateInput, today = dayjs()): string {
  const days = daysUntilBirthday(birthDate, today);
  if (days === null || days > BIRTHDAY_NOTICE_DAYS) return "";
  if (days === 0) return "🎂 ¡Cumple años hoy!";
  if (days === 1) return "🎂 Cumple mañana";
  return `🎂 Cumple en ${days} días`;
}

export function isBirthdayThisMonth(birthDate: DateInput, today = dayjs()): boolean {
  const date = parseBirthDate(birthDate);
  return !!date && date.month() === today.month();
}

// Enlace para escribirle al cliente desde WhatsApp (mismo formato que el resto de la app).
export function whatsAppLink(phone: string | null | undefined): string {
  let digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (!digits.startsWith("57")) digits = "57" + digits;
  return `https://wa.me/${digits}`;
}
