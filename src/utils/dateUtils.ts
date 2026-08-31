import { format, addDays, parseISO, isValid } from 'date-fns';

/**
 * Format a YYYY-MM-DD or ISO date string into readable format (e.g. "03 Sep 2026")
 */
export function formatDate(dateString: string | null | undefined, formatStr: string = 'dd MMM yyyy'): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' && dateString.length === 10
      ? parseISODateOnly(dateString)
      : parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr);
  } catch {
    return dateString || '—';
  }
}

/**
 * Parse YYYY-MM-DD into a local Date object without UTC midnight shifting
 */
export function parseISODateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // use noon to prevent timezone shifts
}

/**
 * Convert Date object to YYYY-MM-DD string
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current date as YYYY-MM-DD in the specified timezone (or browser default)
 */
export function getTodayISODate(timezone?: string): string {
  try {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Returns 'YYYY-MM-DD'
  } catch {
    return toISODateString(new Date());
  }
}

/**
 * Add N days to a YYYY-MM-DD date string and return new YYYY-MM-DD
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const baseDate = parseISODateOnly(dateStr);
  const resultDate = addDays(baseDate, days);
  return toISODateString(resultDate);
}

/**
 * Compare two YYYY-MM-DD date strings:
 * returns < 0 if a < b, 0 if a === b, > 0 if a > b
 */
export function compareDateStrings(dateA: string, dateB: string): number {
  return dateA.localeCompare(dateB);
}
