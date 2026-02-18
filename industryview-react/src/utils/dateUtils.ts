import { format, parseISO, isValid, differenceInDays, addDays, startOfWeek, endOfWeek, type Locale } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  pt: ptBR,
  es: es,
  en: enUS,
};

function getLocale(): Locale {
  const lang = localStorage.getItem('__locale_key__') || 'pt';
  return localeMap[lang] || ptBR;
}

/** Format a date string or Date object */
export function formatDate(date: string | Date | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: getLocale() });
}

/** Format date and time */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/** Format relative date (e.g., "2 days ago") */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  const days = differenceInDays(new Date(), d);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  return formatDate(d);
}

/** Parse timestamp (unix seconds or milliseconds) to Date */
export function parseTimestamp(timestamp: number): Date {
  // If timestamp is in seconds (10 digits), convert to ms
  if (timestamp < 1e12) {
    return new Date(timestamp * 1000);
  }
  return new Date(timestamp);
}

/** Format a unix timestamp */
export function formatTimestamp(timestamp: number, pattern = 'dd/MM/yyyy'): string {
  if (!timestamp) return '';
  return formatDate(parseTimestamp(timestamp), pattern);
}

/** Get the start and end of current week */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

/** Add days to a date */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/** Check if a date string is valid */
export function isValidDate(dateString: string): boolean {
  const d = parseISO(dateString);
  return isValid(d);
}

/** Convert Date to ISO string for API */
export function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
