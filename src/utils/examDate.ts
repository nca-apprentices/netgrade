import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
} from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Absolute exam date, e.g. "07.11.2026".
 */
export const formatExamDate = (date: Date): string =>
  format(date, 'dd.MM.yyyy');

/**
 * Human readable distance to today, e.g. "heute", "morgen", "in 3 Tagen".
 *
 * The nearest days are spelled out because formatDistanceToNow reads badly for
 * them ("in weniger als einer Minute" for an exam later today). Everything
 * beyond that is left to date-fns, which keeps long distances readable
 * ("in etwa 2 Monaten" instead of "in 61 Tagen").
 */
export const formatExamDistance = (date: Date): string => {
  const days = differenceInCalendarDays(date, new Date());

  if (days === 0) return 'heute';
  if (days === 1) return 'morgen';
  if (days === -1) return 'gestern';

  return formatDistanceToNow(date, { locale: de, addSuffix: true });
};
