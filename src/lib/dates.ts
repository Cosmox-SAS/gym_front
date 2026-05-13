import dayjs from "dayjs";

export function formatAppDate(value: string | number | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : fallback;
}

export function formatAppDateTime(value: string | number | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : fallback;
}
