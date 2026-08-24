import { ValueTransformer } from 'typeorm';

/**
 * A TypeORM ValueTransformer for handling Date properties mapped to 'date' database columns.
 *
 * This transformer converts JavaScript `Date` objects to 'YYYY-MM-DD' strings when saving to the database
 * and converts the string representation back to a `Date` object when loading from the database.
 *
 * This is necessary because in some scenarios, particularly when fetching entities
 * using the `transactionManager` (e.g., `transactionManager.findOne`), TypeORM might not
 * automatically perform the type conversion from the database string representation back
 * to a JavaScript `Date` object, potentially returning a string instead. This transformer
 * ensures the `date` property is consistently a `Date` object in the application code.
 */
/**
 * Serialises a Date to 'YYYY-MM-DD' using its *local* parts.
 *
 * `toISOString()` would convert to UTC first and shift the day whenever the
 * offset pushes the timestamp across midnight. A date-only value carries no
 * time, so it must not depend on the clock.
 */
export const toDateOnlyString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Counterpart to `toDateOnlyString`: reads 'YYYY-MM-DD' as a *local* date.
 *
 * `new Date('2026-03-01')` would be parsed as UTC midnight, which is the
 * previous day for anyone behind UTC. Anything that is not a plain date string
 * (e.g. a full timestamp from an older backup) is parsed as-is.
 */
export const fromDateOnlyString = (value: string): Date | null => {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (parts) {
    const [, year, month, day] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const fallback = new Date(value);
  return isNaN(fallback.getTime()) ? null : fallback;
};

export const dateTransformer: ValueTransformer = {
  to: (value: Date | null | undefined): string | null => {
    if (!(value instanceof Date) || isNaN(value.getTime())) return null;

    return toDateOnlyString(value);
  },
  from: (value: string | null | undefined): Date | null =>
    typeof value === 'string' ? fromDateOnlyString(value) : null,
};
