// Misma regla que el backend (WhatsAppService::formatColombianPhone):
// celular colombiano de 10 dígitos que empieza por 3, con o sin el prefijo 57.
export function isValidWhatsAppPhone(phone: string | number | null | undefined): boolean {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return digits.startsWith("3");
  if (digits.length === 12) return digits.startsWith("573");
  return false;
}

export const WHATSAPP_PHONE_ERROR =
  "Para recibir recordatorios por WhatsApp el teléfono debe ser un celular colombiano válido (ej: 300 123 4567).";

export function whatsAppPhoneError(allow: boolean, phone: string | null | undefined): string {
  return allow && !isValidWhatsAppPhone(phone) ? WHATSAPP_PHONE_ERROR : "";
}
