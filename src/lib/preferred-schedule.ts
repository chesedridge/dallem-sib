export type PreferredSchedule = {
  date: string;
  time: string;
};

export const PREFERRED_SCHEDULE_LIMIT = 3;
export const PREFERRED_SCHEDULE_MAX_DATE = "2027-04-30";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function createPreferredScheduleSlots(): PreferredSchedule[] {
  return Array.from({ length: PREFERRED_SCHEDULE_LIMIT }, () => ({
    date: "",
    time: "",
  }));
}

export function getKoreaDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function isValidCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function isValidBirthDate(
  value: string,
  today = getKoreaDateString(),
): boolean {
  return isValidCalendarDate(value) && value <= today;
}

export function isValidPreferredScheduleDate(
  value: string,
  today = getKoreaDateString(),
): boolean {
  return (
    isValidCalendarDate(value) &&
    value >= today &&
    value <= PREFERRED_SCHEDULE_MAX_DATE
  );
}

export function isValidPreferredScheduleTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}
