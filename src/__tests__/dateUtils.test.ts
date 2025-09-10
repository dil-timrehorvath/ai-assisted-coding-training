import { describe, it, expect } from 'vitest';
import { validateDate, formatDateForStorage, parseDateFromStorage } from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('validateDate', () => {
    it('returns true for undefined (optional field)', () => {
      expect(validateDate(undefined)).toBe(true);
    });

    it('returns true for valid ISO date string', () => {
      expect(validateDate('2024-12-31T23:59:59.999Z')).toBe(true);
    });

    it('returns false for invalid date string', () => {
      expect(validateDate('invalid-date')).toBe(false);
    });

    it('returns false for malformed date string', () => {
      expect(validateDate('2024-13-40T25:70:70.999Z')).toBe(false);
    });
  });

  describe('formatDateForStorage', () => {
    it('returns undefined for null date', () => {
      expect(formatDateForStorage(null)).toBeUndefined();
    });

    it('returns ISO string for valid date', () => {
      const date = new Date('2024-12-31T23:59:59.999Z');
      expect(formatDateForStorage(date)).toBe('2024-12-31T23:59:59.999Z');
    });
  });

  describe('parseDateFromStorage', () => {
    it('returns null for undefined string', () => {
      expect(parseDateFromStorage(undefined)).toBeNull();
    });

    it('returns null for invalid date string', () => {
      expect(parseDateFromStorage('invalid-date')).toBeNull();
    });

    it('returns Date object for valid ISO string', () => {
      const result = parseDateFromStorage('2024-12-31T23:59:59.999Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe('2024-12-31T23:59:59.999Z');
    });

    it('returns null for malformed date string', () => {
      expect(parseDateFromStorage('2024-13-40T25:70:70.999Z')).toBeNull();
    });
  });
});
