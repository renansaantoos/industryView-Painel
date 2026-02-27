/**
 * Hook with utilities for business day calculations (Mon–Fri, no holidays).
 */
export function useBusinessDays() {
  /** Count business days between start and end (inclusive). */
  function countBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  /** Return the date after adding N business days to start. */
  function addBusinessDays(start: Date, days: number): Date {
    const result = new Date(start);
    result.setHours(0, 0, 0, 0);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return result;
  }

  return { countBusinessDays, addBusinessDays };
}
