import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatExamDate, formatExamDistance } from '@/utils/examDate';

describe('examDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-13T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatExamDate', () => {
    it('formats the absolute date', () => {
      expect(formatExamDate(new Date('2026-11-07T12:00:00'))).toBe(
        '07.11.2026',
      );
    });
  });

  describe('formatExamDistance', () => {
    it('spells out the current day', () => {
      expect(formatExamDistance(new Date('2026-08-13T18:00:00'))).toBe('heute');
    });

    it('spells out tomorrow', () => {
      expect(formatExamDistance(new Date('2026-08-14T08:00:00'))).toBe(
        'morgen',
      );
    });

    it('spells out yesterday', () => {
      expect(formatExamDistance(new Date('2026-08-12T08:00:00'))).toBe(
        'gestern',
      );
    });

    it('counts days for dates within the next week', () => {
      expect(formatExamDistance(new Date('2026-08-16T10:00:00'))).toBe(
        'in 3 Tagen',
      );
    });

    it('keeps far away dates coarse instead of counting days', () => {
      const distance = formatExamDistance(new Date('2026-11-07T10:00:00'));

      expect(distance).toMatch(/^in .*Monat/);
      expect(distance).not.toMatch(/Tagen/);
    });

    it('marks past exams as past', () => {
      expect(formatExamDistance(new Date('2026-08-06T10:00:00'))).toBe(
        'vor 7 Tagen',
      );
    });
  });
});
